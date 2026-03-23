const { foodPool } = require('../config/db');

class Restaurant {
  static _columns = null;
  static _foodColumns = null;

  static async getColumns() {
    if (this._columns) {
      return this._columns;
    }

    const result = await foodPool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'restaurants'`
    );

    this._columns = new Set((result.rows || []).map((row) => row.column_name));
    return this._columns;
  }

  static async getFoodColumns() {
    if (this._foodColumns) {
      return this._foodColumns;
    }

    const result = await foodPool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'foods'`
    );

    this._foodColumns = new Set((result.rows || []).map((row) => row.column_name));
    return this._foodColumns;
  }

  /*
    ================================================================
    ================================================================

    API cho nhà hàng client-side (dùng bên khách hàng)

    ================================================================
    ================================================================
  */
  // lấy tất cả nhà hàng (GET /restaurants )
  static async getAll(filters = {}) {
    const foodColumns = await this.getFoodColumns();
    const categoryColumn = foodColumns.has('primary_category_id')
      ? 'f.primary_category_id'
      : (foodColumns.has('category_id') ? 'f.category_id' : null);

    let query = `
        SELECT r.*, 
          rl.latitude,
          rl.longitude,
          COALESCE(r.rating, 0) AS avg_rating,
          COALESCE(r.total_reviews, 0) AS review_count
      FROM restaurants r
        LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
      WHERE r.status = 'active'
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
      query += ` AND (r.name ILIKE $${paramIndex} OR r.address ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.is_featured) {
      query += ` AND r.is_featured = $${paramIndex}`;
      params.push(filters.is_featured);
      paramIndex++;
    }

    if (filters.category_id && categoryColumn) {
      query += `
        AND EXISTS (
          SELECT 1
          FROM foods f
          WHERE f.restaurant_id = r.id
            AND ${categoryColumn} = $${paramIndex}
        )
      `;
      params.push(filters.category_id);
      paramIndex++;
    }

    query += ` ORDER BY r.created_at DESC`;

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
        r.id,
        r.name,
        r.address,
        r.phone,
        r.image_url,
        r.description,
        r.status,
        r.rating,
        r.total_reviews,
        rl.latitude,
        rl.longitude
      FROM restaurants r
      LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
      WHERE r.id = $1 AND r.status = 'active'
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

  

  // tạo thêm nhà hàng vào csdl (nhà hàng đó đăng kí chẳng hạn) (POST /restaurants )
  // api dùng cho 'nhà hàng' đăng kí làm dịch vụ
  static async create(restaurantData) {
    const {
      name, address, phone, image_url, description,
      delivery_time_min, delivery_time_max, min_order_value, delivery_fee
    } = restaurantData;

    const query = `
      INSERT INTO restaurants (
        name, address, phone, image_url, description,
        delivery_time_min, delivery_time_max, min_order_value, delivery_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      name, address, phone, image_url, description,
      delivery_time_min, delivery_time_max, min_order_value, delivery_fee
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
      WHERE id = $1
      RETURNING *
    `;

    const result = await foodPool.query(query, [id, ...values]);
    return result.rows[0];
  }

  static async getNearbyRestaurants(latitude, longitude, limit = 12) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    const safeLimit = Math.max(Number(limit) || 12, 1);

    const query = `
      SELECT
        r.*, 
        rl.latitude,
        rl.longitude,
        COALESCE(r.rating, 0) as avg_rating,
        COALESCE(r.total_reviews, 0) as review_count,
        SQRT(
          POWER(CAST(rl.latitude AS numeric) - $1, 2)
          +
          POWER(CAST(rl.longitude AS numeric) - $2, 2)
        ) as euclidean_distance
      FROM restaurants r
      LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
      WHERE r.status = 'active'
        AND rl.latitude IS NOT NULL
        AND rl.longitude IS NOT NULL
      ORDER BY euclidean_distance ASC
      LIMIT $3
    `;

    const result = await foodPool.query(query, [lat, lng, safeLimit]);
    return result.rows;
  }

  /*
    ================================================================
    ================================================================

    API cho nhà hàng SERVER-SIDE (dùng bên ADMIN)

    ================================================================
    ================================================================
  */
  
  /*
    Lấy tất cả nhà hàng với phân trang (cho admin)
  */
  static async getAllWithPagination(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          r.*,
          COUNT(f.food_id) as total_foods
        FROM restaurants r
        LEFT JOIN foods f ON r.id = f.restaurant_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;

      // Filter by status
      if (filters.status) {
        query += ` AND r.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      // Filter by search
      if (filters.search) {
        query += ` AND (r.name ILIKE $${paramIndex} OR r.address ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      query += ` GROUP BY r.id`;
      query += ` ORDER BY r.created_at DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await foodPool.query(query, params);

      // Get total count
      let countQuery = `SELECT COUNT(DISTINCT r.id) as total FROM restaurants r WHERE 1=1`;
      const countParams = [];
      let countParamIndex = 1;

      if (filters.status) {
        countQuery += ` AND r.status = $${countParamIndex}`;
        countParams.push(filters.status);
        countParamIndex++;
      }

      if (filters.search) {
        countQuery += ` AND (r.name ILIKE $${countParamIndex} OR r.address ILIKE $${countParamIndex})`;
        countParams.push(`%${filters.search}%`);
      }

      const countResult = await foodPool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return {
        restaurants: result.rows,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /*
    Lấy thống kê nhà hàng (cho admin dashboard)
  */
  static async getStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active') as active_count,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
          COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count,
          COUNT(*) as total_count,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_this_month
        FROM restaurants
      `;

      const result = await foodPool.query(query);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /*
    Cập nhật trạng thái nhà hàng
  */
  static async updateStatus(id, status, reason = null) {
    try {
      const columns = await this.getColumns();
      const hasRejectionReason = columns.has('rejection_reason');
      const query = hasRejectionReason
        ? `
            UPDATE restaurants 
            SET 
              status = $1,
              rejection_reason = $2,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
          `
        : `
            UPDATE restaurants 
            SET 
              status = $1,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
          `;

      const result = await foodPool.query(
        query,
        hasRejectionReason ? [status, reason, id] : [status, id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /*
    Phê duyệt nhà hàng.
    default status là inactive, chuyển sang active là nhà hàng được phép hoạt động
  */
  static async approveRestaurant(id) {
    return await this.updateStatus(id, 'active', null);
  }

  /*
    Từ chối nhà hàng
  */
  static async rejectRestaurant(id, reason) {
    if (!reason || reason.trim() === '') {
      throw new Error('Lý do từ chối là bắt buộc');
    }
    return await this.updateStatus(id, 'rejected', reason);
  }

  /*
      Lấy chi tiết nhà hàng theo ID (trang admin)
  */
  static async getRestaurantByIdAdmin(id) {
    try {
      const query = `
        SELECT 
          r.*,
          COUNT(DISTINCT f.food_id) as total_foods,
          COUNT(DISTINCT CASE WHEN f.is_available = true THEN f.food_id END) as available_foods
        FROM restaurants r
        LEFT JOIN foods f ON r.id = f.restaurant_id
        WHERE r.id = $1
        GROUP BY r.id
      `;

      const result = await foodPool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      // Convert total_foods từ string sang number
      const restaurant = {
        ...result.rows[0],
        total_foods: parseInt(result.rows[0].total_foods) || 0,
        available_foods: parseInt(result.rows[0].available_foods) || 0
      };

      return restaurant;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Restaurant;