const { foodPool } = require('../config/db');

class Promotion {
  // Lấy tất cả promotions (GET /promotions)
  static async getAll(filters = {}) {
    let query = `
      SELECT p.*, 
             ARRAY_AGG(pr.restaurant_id) AS restaurant_ids
      FROM promotions p
      LEFT JOIN promotion_restaurants pr ON p.id = pr.promotion_id
      WHERE p.is_active = true
    `;
    const params = [];
    let paramIndex = 1;

    // lọc theo loại (từ chính restaurant? từ fooddeli?)
    if (filters.is_platform !== undefined) {
      query += ` AND p.is_platform = $${paramIndex}`;
      params.push(filters.is_platform);
      paramIndex++;
    }

    if (filters.restaurant_id) {
      query += ` AND (pr.restaurant_id = $${paramIndex} OR p.is_platform = true)`;
      params.push(filters.restaurant_id);
      paramIndex++;
    }

    if (filters.applicable_day) {
      query += ` AND p.applicable_days ILIKE $${paramIndex}`;
      params.push(`%${filters.applicable_day}%`);
      paramIndex++;
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await foodPool.query(query, params);
    return result.rows;
  }

  // Lấy promotion theo id
  static async getById(id) {
    const query = `
      SELECT p.*, 
             ARRAY_AGG(pr.restaurant_id) AS restaurant_ids
      FROM promotions p
      LEFT JOIN promotion_restaurants pr ON p.id = pr.promotion_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    const result = await foodPool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Lấy promotions theo restaurant
  static async getPromotionsByRestaurantId(restaurantId) {
    const query = `
      SELECT p.*
      FROM promotions p
      LEFT JOIN promotion_restaurants pr ON p.id = pr.promotion_id
      WHERE (p.is_platform = true OR pr.restaurant_id = $1)
        AND p.is_active = true
        AND NOW() BETWEEN p.start_date AND p.end_date
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    const result = await foodPool.query(query, [restaurantId]);
    return result.rows;
  }

  // Tạo promotion mới
  static async create(promotionData) {
    const {
      title, description, discount_type, discount_value,
      min_order_value, max_discount_value, applicable_days,
      start_date, end_date, is_platform, is_active
    } = promotionData;

    const query = `
      INSERT INTO promotions (
        title, description, discount_type, discount_value,
        min_order_value, max_discount_value, applicable_days,
        start_date, end_date, is_platform, is_active
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `;

    const values = [
      title, description, discount_type, discount_value,
      min_order_value, max_discount_value, applicable_days,
      start_date, end_date, is_platform, is_active
    ];

    const result = await foodPool.query(query, values);
    return result.rows[0];
  }

  // Cập nhật promotion
  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    const setClause = fields.map((field, index) =>
      `${field} = $${index + 2}`
    ).join(', ');

    const query = `
      UPDATE promotions 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await foodPool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Xóa promotion
  static async delete(id) {
    const query = `DELETE FROM promotions WHERE id = $1 RETURNING *`;
    const result = await foodPool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Promotion;
