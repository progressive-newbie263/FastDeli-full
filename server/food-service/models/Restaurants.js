const { foodPool } = require('../config/db');

class Restaurant {
  // lấy tất cả nhà hàng (GET /restaurants )
  static async getAll(filters = {}) {
    let query = `
      SELECT r.*, 
             COALESCE(AVG(rev.rating), 0) as avg_rating,
             COUNT(rev.review_id) as review_count
      FROM restaurants r
      LEFT JOIN reviews rev ON r.restaurant_id = rev.restaurant_id
      WHERE r.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
      query += ` AND r.restaurant_name ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.is_featured) {
      query += ` AND r.is_featured = $${paramIndex}`;
      params.push(filters.is_featured);
      paramIndex++;
    }

    query += ` GROUP BY r.restaurant_id ORDER BY r.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    const result = await foodPool.query(query, params);
    return result.rows;
  }

  // lấy ra một nhà hàng dựa theo id (GET /restaurants/:id )
  static async getRestaurantById(id) {
    const query = `
      SELECT 
        r.restaurant_id,
        r.restaurant_name,
        r.address,
        r.phone,
        r.image_url,
        r.description,
        r.is_active,
        COALESCE(ROUND(AVG(rev.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(rev.review_id) AS review_count
      FROM restaurants r
      LEFT JOIN reviews rev ON r.restaurant_id = rev.restaurant_id
      WHERE r.restaurant_id = $1 AND r.is_active = true
      GROUP BY r.restaurant_id
    `;

    try {
      const result = await foodPool.query(query, [id]);

      if (result.rows.length === 0) {
        return null; // hoặc throw lỗi 404 tùy bạn xử lý phía controller
      }

      return result.rows[0];
    } catch (err) {
      console.error('Database error in getRestaurantById:', err);
      throw new Error('Lỗi khi lấy thông tin nhà hàng');
    }
  }


  // tạo thêm nhà hàng vào csdl (nhà hàng đó đăng kí chẳng hạn) (POST /restaurants )
  static async create(restaurantData) {
    const {
      restaurant_name, address, phone, image_url, description,
      delivery_time, min_order_amount, delivery_fee
    } = restaurantData;

    const query = `
      INSERT INTO restaurants (
        restaurant_name, address, phone, image_url, description,
        delivery_time, min_order_amount, delivery_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      restaurant_name, address, phone, image_url, description,
      delivery_time, min_order_amount, delivery_fee
    ];

    const result = await foodPool.query(query, values);
    return result.rows[0];
  }

  // cập nhật nhà hàng
  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = fields.map((field, index) => 
      `${field} = $${index + 2}`
    ).join(', ');

    const query = `
      UPDATE restaurants 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE restaurant_id = $1
      RETURNING *
    `;

    const result = await foodPool.query(query, [id, ...values]);
    return result.rows[0];
  }
}

module.exports = Restaurant;