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
        c.min_order_amount,
        c.max_discount,
        c.start_date,
        c.end_date,
        c.is_platform,
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
        c.min_order_amount,
        c.max_discount,
        c.start_date,
        c.end_date,
        c.is_platform,
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
