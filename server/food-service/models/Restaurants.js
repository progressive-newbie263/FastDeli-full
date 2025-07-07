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
  // hiện tại chưa làm đến phần review , nên chỉ lấy ra text cứng
  // sau này sẽ lấy ra review của nhà hàng đó sau (vì giờ đã có cái quái gì đâu để tính).
  static async getRestaurantById(id) {
    const query = `
      SELECT 
        restaurant_id,
        restaurant_name,
        address,
        phone,
        image_url,
        description,
        is_active,
        rating,
        total_reviews
      FROM restaurants
      WHERE restaurant_id = $1 AND is_active = true
    `;

    try {
      const result = await foodPool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (err) {
      console.error('Database error in getRestaurantById:', err);
      throw new Error('Lỗi khi lấy thông tin nhà hàng');
    }
  }

  // lấy nhà hàng theo id và kèm theo món ăn của nhà hàng đó (GET /restaurants/:id/foods )
  // Lấy nhà hàng theo ID kèm theo danh sách món ăn (GET /restaurants/:id/foods)
  static async getFoodsByRestaurantId(id, filters = {}) {
    try {
      let query = `
        SELECT 
          f.food_id,
          f.food_name,
          f.description,
          f.price,
          f.image_url,
          f.is_available,
          f.created_at,
          fc1.category_id AS primary_category_id,
          fc1.category_name AS primary_category_name,
          fc2.category_id AS secondary_category_id,
          fc2.category_name AS secondary_category_name
        FROM foods f
        LEFT JOIN food_categories fc1 ON f.primary_category_id = fc1.category_id
        LEFT JOIN food_categories fc2 ON f.secondary_category_id = fc2.category_id
        JOIN restaurants r ON f.restaurant_id = r.restaurant_id
        WHERE f.restaurant_id = $1 AND f.is_available = true AND r.is_active = true
      `;

      const params = [id];
      let paramIndex = 2;

      if (filters.primary_category_id) {
        query += ` AND f.primary_category_id = $${paramIndex}`;
        params.push(filters.primary_category_id);
        paramIndex++;
      }

      if (filters.secondary_category_id) {
        query += ` AND f.secondary_category_id = $${paramIndex}`;
        params.push(filters.secondary_category_id);
        paramIndex++;
      }

      if (filters.search) {
        query += ` AND f.food_name ILIKE $${paramIndex}`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

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
      }

      const result = await foodPool.query(query, params);

      const foods = result.rows.map(row => ({
        food_id: row.food_id,
        food_name: row.food_name,
        image_url: row.image_url || null,
        price: row.price,
        is_available: row.is_available,
        primary_category: {
          id: row.primary_category_id,
          name: row.primary_category_name
        },
        secondary_category: row.secondary_category_id
          ? {
              id: row.secondary_category_id,
              name: row.secondary_category_name
            }
          : null
      }));

      return {
        foods,
        total_foods: foods.length
      };

    } catch (err) {
      console.error('Database error in getFoodsByRestaurantId:', err);
      throw new Error('Lỗi khi lấy danh sách món ăn');
    }
  }




  // tạo thêm nhà hàng vào csdl (nhà hàng đó đăng kí chẳng hạn) (POST /restaurants )
  // api dùng cho 'nhà hàng' đăng kí làm dịch vụ
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