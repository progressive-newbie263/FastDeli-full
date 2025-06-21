const { foodPool } = require('../config/db');

class Food {
  // Lấy tất cả món ăn với filters
  static async getAll(filters = {}) {
    let query = `
      SELECT f.*, 
             r.restaurant_name,
             fc.category_name
      FROM foods f
      LEFT JOIN restaurants r ON f.restaurant_id = r.restaurant_id
      LEFT JOIN food_categories fc ON f.category_id = fc.category_id
      WHERE f.is_available = true AND r.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;

    // Filter theo tên món ăn
    if (filters.search) {
      query += ` AND f.food_name ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Filter theo restaurant_id
    if (filters.restaurant_id) {
      query += ` AND f.restaurant_id = $${paramIndex}`;
      params.push(filters.restaurant_id);
      paramIndex++;
    }

    // Filter theo category_id
    if (filters.category_id) {
      query += ` AND f.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    // Filter theo khoảng giá
    if (filters.min_price) {
      query += ` AND f.price >= $${paramIndex}`;
      params.push(filters.min_price);
      paramIndex++;
    }

    if (filters.max_price) {
      query += ` AND f.price <= $${paramIndex}`;
      params.push(filters.max_price);
      paramIndex++;
    }

    query += ` ORDER BY f.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    const result = await foodPool.query(query, params);
    return result.rows;
  }

  // Lấy món ăn theo ID
  static async getById(id) {
    const query = `
      SELECT f.*, 
             r.restaurant_name,
             r.address as restaurant_address,
             r.phone as restaurant_phone,
             fc.category_name
      FROM foods f
      LEFT JOIN restaurants r ON f.restaurant_id = r.restaurant_id
      LEFT JOIN food_categories fc ON f.category_id = fc.category_id
      WHERE f.food_id = $1 AND f.is_available = true AND r.is_active = true
    `;
    
    const result = await foodPool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy món ăn theo restaurant ID
  static async getByRestaurantId(restaurantId, filters = {}) {
    let query = `
      SELECT f.*, 
             fc.category_name
      FROM foods f
      LEFT JOIN food_categories fc ON f.category_id = fc.category_id
      WHERE f.restaurant_id = $1 AND f.is_available = true
    `;
    
    const params = [restaurantId];
    let paramIndex = 2;

    if (filters.category_id) {
      query += ` AND f.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND f.food_name ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY f.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await foodPool.query(query, params);
    return result.rows;
  }

  // Tạo món ăn mới
  static async create(foodData) {
    const {
      restaurant_id, category_id, food_name, description, 
      price, image_url, is_available = true
    } = foodData;

    const query = `
      INSERT INTO foods (
        restaurant_id, category_id, food_name, description,
        price, image_url, is_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      restaurant_id, category_id, food_name, description,
      price, image_url, is_available
    ];

    const result = await foodPool.query(query, values);
    return result.rows[0];
  }

  // Cập nhật món ăn
  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = fields.map((field, index) => 
      `${field} = $${index + 2}`
    ).join(', ');

    const query = `
      UPDATE foods 
      SET ${setClause}
      WHERE food_id = $1
      RETURNING *
    `;

    const result = await foodPool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Xóa món ăn (soft delete)
  static async delete(id) {
    const query = `
      UPDATE foods 
      SET is_available = false
      WHERE food_id = $1
      RETURNING *
    `;

    const result = await foodPool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy món ăn nổi bật (trending)
  static async getFeatured(type = 'trending_food', limit = 10) {
    const query = `
      SELECT f.*, 
             r.restaurant_name,
             fc.category_name,
             fi.title as featured_title,
             fi.description as featured_description
      FROM featured_items fi
      JOIN foods f ON fi.food_id = f.food_id
      LEFT JOIN restaurants r ON f.restaurant_id = r.restaurant_id
      LEFT JOIN food_categories fc ON f.category_id = fc.category_id
      WHERE fi.type = $1 AND fi.is_active = true 
            AND f.is_available = true AND r.is_active = true
      ORDER BY fi.sort_order ASC, fi.created_at DESC
      LIMIT $2
    `;

    const result = await foodPool.query(query, [type, limit]);
    return result.rows;
  }
}

module.exports = Food;