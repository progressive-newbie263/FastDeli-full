const { foodPool } = require('../config/db');

class Coupon {
  static _columns = null;

  static async getColumns() {
    if (this._columns !== null) {
      return this._columns;
    }

    const result = await foodPool.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'coupons'
      `
    );

    this._columns = new Set((result.rows || []).map((row) => row.column_name));
    return this._columns;
  }

  static async getAvailable({ restaurantId = null }) {
    const columns = await this.getColumns();
    const hasRestaurantIdColumn = columns.has('restaurant_id');
    const hasUsageLimitColumn = columns.has('usage_limit');
    const hasUsedCountColumn = columns.has('used_count');
    const hasCreatedAtColumn = columns.has('created_at');

    const restaurantSelect = hasRestaurantIdColumn ? 'c.restaurant_id' : 'NULL::integer AS restaurant_id';
    const restaurantFilter = hasRestaurantIdColumn
      ? 'AND (c.is_platform = true OR c.restaurant_id = $1)'
      : '';
    const usageFilter = hasUsageLimitColumn && hasUsedCountColumn
      ? 'AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)'
      : '';
    const orderBy = hasCreatedAtColumn
      ? 'ORDER BY c.is_platform DESC, c.created_at DESC'
      : 'ORDER BY c.is_platform DESC, c.id DESC';

    const query = `
      SELECT
        c.id,
        c.code,
        c.title,
        c.description,
        c.discount_type,
        c.discount_value,
        c.min_order_value,
        c.max_discount,
        c.start_date,
        c.end_date,
        c.is_platform,
        c.image_url,
        ${restaurantSelect}
      FROM coupons c
      WHERE c.is_active = true
        AND CURRENT_TIMESTAMP BETWEEN c.start_date AND c.end_date
        ${usageFilter}
        ${restaurantFilter}
      ${orderBy}
    `;

    const params = hasRestaurantIdColumn ? [restaurantId] : [];
    const result = await foodPool.query(query, params);
    return result.rows;
  }

  static async getByCode({ code, restaurantId = null }) {
    const columns = await this.getColumns();
    const hasRestaurantIdColumn = columns.has('restaurant_id');
    const hasUsageLimitColumn = columns.has('usage_limit');
    const hasUsedCountColumn = columns.has('used_count');

    const restaurantSelect = hasRestaurantIdColumn ? 'c.restaurant_id' : 'NULL::integer AS restaurant_id';
    const restaurantFilter = hasRestaurantIdColumn
      ? 'AND (c.is_platform = true OR c.restaurant_id = $2)'
      : '';
    const usageFilter = hasUsageLimitColumn && hasUsedCountColumn
      ? 'AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)'
      : '';

    const query = `
      SELECT
        c.id,
        c.code,
        c.title,
        c.description,
        c.discount_type,
        c.discount_value,
        c.min_order_value,
        c.max_discount,
        c.start_date,
        c.end_date,
        c.is_platform,
        c.image_url,
        ${restaurantSelect}
      FROM coupons c
      WHERE UPPER(c.code) = UPPER($1)
        AND c.is_active = true
        AND CURRENT_TIMESTAMP BETWEEN c.start_date AND c.end_date
        ${usageFilter}
        ${restaurantFilter}
      LIMIT 1
    `;

    const params = hasRestaurantIdColumn ? [code, restaurantId] : [code];
    const result = await foodPool.query(query, params);
    return result.rows[0] || null;
  }

  static async getByRestaurant(restaurantId) {
    const columns = await this.getColumns();
    const hasRestaurantIdColumn = columns.has('restaurant_id');
    const hasCreatedAtColumn = columns.has('created_at');

    if (!hasRestaurantIdColumn) {
      return [];
    }

    const orderBy = hasCreatedAtColumn ? 'ORDER BY c.created_at DESC' : 'ORDER BY c.id DESC';
    const result = await foodPool.query(
      `
      SELECT
        c.id,
        c.code,
        c.title,
        c.description,
        c.discount_type,
        c.discount_value,
        c.min_order_value,
        c.max_discount,
        c.start_date,
        c.end_date,
        c.is_active,
        c.is_platform,
        c.image_url,
        c.restaurant_id
      FROM coupons c
      WHERE c.restaurant_id = $1
      ${orderBy}
      `,
      [restaurantId]
    );

    return result.rows;
  }

  static async createForRestaurant({
    restaurantId,
    code,
    title = null,
    description = null,
    discountType,
    discountValue,
    minOrderValue = 0,
    maxDiscount = null,
    startDate,
    endDate,
    isActive = true,
    imageUrl,
  }) {
    const columns = await this.getColumns();
    const fields = [];
    const placeholders = [];
    const values = [];

    const pushField = (column, value) => {
      fields.push(column);
      values.push(value);
      placeholders.push(`$${values.length}`);
    };

    pushField('code', String(code || '').trim().toUpperCase());
    if (columns.has('title')) pushField('title', title || null);
    if (columns.has('description')) pushField('description', description || null);
    pushField('discount_type', discountType);
    pushField('discount_value', Number(discountValue));
    if (columns.has('min_order_value')) pushField('min_order_value', Number(minOrderValue || 0));
    if (columns.has('max_discount')) pushField('max_discount', maxDiscount === null || maxDiscount === undefined ? null : Number(maxDiscount));
    pushField('start_date', startDate);
    pushField('end_date', endDate);
    if (columns.has('is_active')) pushField('is_active', Boolean(isActive));
    if (columns.has('is_platform')) pushField('is_platform', false);
    if (columns.has('restaurant_id')) pushField('restaurant_id', Number(restaurantId));
    if (columns.has('image_url')) pushField('image_url', imageUrl || null);

    const query = `
      INSERT INTO coupons (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await foodPool.query(query, values);
    return result.rows[0];
  }

  static async updateForRestaurant({ couponId, restaurantId, updates }) {
    const columns = await this.getColumns();
    const setClauses = [];
    const values = [];

    const appendUpdate = (column, valueTransform = (value) => value) => {
      if (!columns.has(column)) return;
      const nextValue = updates?.[column];
      if (nextValue === undefined) return;
      values.push(valueTransform(nextValue));
      setClauses.push(`${column} = $${values.length}`);
    };

    appendUpdate('code', (value) => String(value).trim().toUpperCase());
    appendUpdate('title');
    appendUpdate('description');
    appendUpdate('discount_type');
    appendUpdate('discount_value', (value) => Number(value));
    appendUpdate('min_order_value', (value) => Number(value || 0));
    appendUpdate('max_discount', (value) => (value === null || value === undefined ? null : Number(value)));
    appendUpdate('start_date');
    appendUpdate('end_date');
    appendUpdate('is_active', (value) => Boolean(value));
    appendUpdate('image_url', (value) => value || null);

    if (setClauses.length === 0) {
      const result = await foodPool.query(
        `
          SELECT *
          FROM coupons
          WHERE id = $1
            AND restaurant_id = $2
          LIMIT 1
        `,
        [couponId, restaurantId]
      );
      return result.rows[0] || null;
    }

    if (columns.has('updated_at')) {
      setClauses.push('updated_at = CURRENT_TIMESTAMP');
    }

    values.push(Number(couponId));
    values.push(Number(restaurantId));

    const query = `
      UPDATE coupons
      SET ${setClauses.join(', ')}
      WHERE id = $${values.length - 1}
        AND restaurant_id = $${values.length}
      RETURNING *
    `;

    const result = await foodPool.query(query, values);
    return result.rows[0] || null;
  }

  static calculateDiscount(coupon, orderTotal) {
    const safeOrderTotal = Math.max(Number(orderTotal) || 0, 0);
    if (!coupon) {
      return 0;
    }

    let discount = 0;

    if (coupon.discount_type === 'percentage') {
      discount = (safeOrderTotal * Number(coupon.discount_value || 0)) / 100;
    } else {
      discount = Number(coupon.discount_value || 0);
    }

    if (coupon.max_discount !== null && coupon.max_discount !== undefined) {
      discount = Math.min(discount, Number(coupon.max_discount));
    }

    return Math.max(Math.min(discount, safeOrderTotal), 0);
  }
}

module.exports = Coupon;
