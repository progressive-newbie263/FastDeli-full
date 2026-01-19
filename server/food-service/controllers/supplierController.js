const db = require('../config/db');

/**
 * Lấy thông tin restaurant của supplier
 */
const getMyRestaurant = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM foods WHERE restaurant_id = r.id) as total_foods,
        (SELECT COUNT(*) FROM orders WHERE restaurant_id = r.id) as total_orders,
        (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id) as avg_rating
       FROM restaurants r
       WHERE r.owner_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bạn chưa có nhà hàng nào. Vui lòng liên hệ admin để đăng ký.'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get my restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin nhà hàng.'
    });
  }
};

/**
 * Lấy thống kê dashboard cho supplier
 */
const getStatistics = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;

    // Tổng doanh thu
    const revenueResult = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders 
       WHERE restaurant_id = $1 AND status = 'delivered'`,
      [restaurantId]
    );

    // Số lượng đơn hàng
    const ordersResult = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'delivering' THEN 1 END) as delivering_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
       FROM orders 
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    // Số lượng món ăn
    const foodsResult = await db.query(
      `SELECT 
        COUNT(*) as total_foods,
        COUNT(CASE WHEN is_available = true THEN 1 END) as available_foods,
        COUNT(CASE WHEN is_available = false THEN 1 END) as unavailable_foods
       FROM foods 
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    // Đánh giá trung bình
    const ratingResult = await db.query(
      `SELECT 
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as total_reviews
       FROM reviews 
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    // Doanh thu theo ngày (7 ngày gần nhất)
    const revenueChartResult = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders_count
       FROM orders
       WHERE restaurant_id = $1 
         AND status = 'delivered'
         AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [restaurantId]
    );

    res.json({
      success: true,
      data: {
        revenue: {
          total: parseFloat(revenueResult.rows[0].total_revenue),
          trend: 0 // TODO: Tính trend so với tuần trước
        },
        orders: ordersResult.rows[0],
        foods: foodsResult.rows[0],
        rating: {
          average: parseFloat(ratingResult.rows[0].avg_rating).toFixed(1),
          total_reviews: parseInt(ratingResult.rows[0].total_reviews)
        },
        revenueChart: revenueChartResult.rows
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê.'
    });
  }
};

/**
 * Lấy danh sách đơn hàng của restaurant
 */
const getOrders = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { status, page = 1, limit = 10, search } = req.query;

    let query = `
      SELECT o.*, 
        u.full_name as customer_name,
        u.phone_number as customer_phone,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'food_name', f.name,
          'quantity', oi.quantity,
          'price', oi.price
        ))
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.restaurant_id = $1
    `;

    const params = [restaurantId];
    let paramCount = 1;

    // Filter by status
    if (status && status !== 'all') {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    // Search by customer name, phone, or order code
    if (search) {
      paramCount++;
      query += ` AND (
        u.full_name ILIKE $${paramCount} OR 
        u.phone_number ILIKE $${paramCount} OR
        o.id::text ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY o.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.restaurant_id = $1
    `;
    const countParams = [restaurantId];
    let countParamIndex = 1;

    if (status && status !== 'all') {
      countParamIndex++;
      countQuery += ` AND o.status = $${countParamIndex}`;
      countParams.push(status);
    }

    if (search) {
      countParamIndex++;
      countQuery += ` AND (
        u.full_name ILIKE $${countParamIndex} OR 
        u.phone_number ILIKE $${countParamIndex} OR
        o.id::text ILIKE $${countParamIndex}
      )`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalOrders = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalItems: totalOrders,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng.'
    });
  }
};

/**
 * Lấy chi tiết đơn hàng
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurantId;

    const result = await db.query(
      `SELECT o.*,
        u.full_name as customer_name,
        u.phone_number as customer_phone,
        u.email as customer_email,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'food_id', oi.food_id,
          'food_name', f.name,
          'quantity', oi.quantity,
          'price', oi.price,
          'image_url', f.image_url
        ))
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        WHERE oi.order_id = o.id
        ) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id
       WHERE o.id = $1 AND o.restaurant_id = $2`,
      [orderId, restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng.'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get order by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết đơn hàng.'
    });
  }
};

/**
 * Cập nhật trạng thái đơn hàng
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const restaurantId = req.restaurantId;

    const allowedStatuses = ['confirmed', 'processing', 'ready', 'cancelled'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ.'
      });
    }

    // Verify order belongs to restaurant
    const checkResult = await db.query(
      'SELECT status FROM orders WHERE id = $1 AND restaurant_id = $2',
      [orderId, restaurantId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng.'
      });
    }

    // Update status
    const result = await db.query(
      `UPDATE orders 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND restaurant_id = $3
       RETURNING *`,
      [status, orderId, restaurantId]
    );

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng.'
    });
  }
};

/**
 * Lấy danh sách món ăn của restaurant
 */
const getFoods = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { category, search, is_available } = req.query;

    let query = `
      SELECT f.*,
        fc.name as category_name
      FROM foods f
      LEFT JOIN food_categories fc ON f.category_id = fc.id
      WHERE f.restaurant_id = $1
    `;

    const params = [restaurantId];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND f.category_id = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND f.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    if (is_available !== undefined) {
      paramCount++;
      query += ` AND f.is_available = $${paramCount}`;
      params.push(is_available === 'true');
    }

    query += ` ORDER BY f.created_at DESC`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách món ăn.'
    });
  }
};

/**
 * Tạo món ăn mới
 */
const createFood = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { name, description, price, category_id, image_url, is_available = true } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Tên món ăn và giá là bắt buộc.'
      });
    }

    const result = await db.query(
      `INSERT INTO foods (restaurant_id, name, description, price, category_id, image_url, is_available, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [restaurantId, name, description, price, category_id, image_url, is_available]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo món ăn thành công.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo món ăn.'
    });
  }
};

/**
 * Cập nhật món ăn
 */
const updateFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    const restaurantId = req.restaurantId;
    const { name, description, price, category_id, image_url, is_available } = req.body;

    // Verify food belongs to restaurant
    const checkResult = await db.query(
      'SELECT id FROM foods WHERE id = $1 AND restaurant_id = $2',
      [foodId, restaurantId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn.'
      });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }
    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      params.push(description);
    }
    if (price !== undefined) {
      paramCount++;
      updates.push(`price = $${paramCount}`);
      params.push(price);
    }
    if (category_id !== undefined) {
      paramCount++;
      updates.push(`category_id = $${paramCount}`);
      params.push(category_id);
    }
    if (image_url !== undefined) {
      paramCount++;
      updates.push(`image_url = $${paramCount}`);
      params.push(image_url);
    }
    if (is_available !== undefined) {
      paramCount++;
      updates.push(`is_available = $${paramCount}`);
      params.push(is_available);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin nào được cập nhật.'
      });
    }

    paramCount++;
    updates.push(`updated_at = NOW()`);
    params.push(foodId);
    
    paramCount++;
    params.push(restaurantId);

    const query = `
      UPDATE foods 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount - 1} AND restaurant_id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, params);

    res.json({
      success: true,
      message: 'Cập nhật món ăn thành công.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật món ăn.'
    });
  }
};

/**
 * Xóa món ăn
 */
const deleteFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    const restaurantId = req.restaurantId;

    // Verify food belongs to restaurant
    const checkResult = await db.query(
      'SELECT id FROM foods WHERE id = $1 AND restaurant_id = $2',
      [foodId, restaurantId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn.'
      });
    }

    await db.query(
      'DELETE FROM foods WHERE id = $1 AND restaurant_id = $2',
      [foodId, restaurantId]
    );

    res.json({
      success: true,
      message: 'Xóa món ăn thành công.'
    });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa món ăn.'
    });
  }
};

/**
 * Toggle trạng thái món ăn (available/unavailable)
 */
const toggleFoodAvailability = async (req, res) => {
  try {
    const { foodId } = req.params;
    const restaurantId = req.restaurantId;

    const result = await db.query(
      `UPDATE foods 
       SET is_available = NOT is_available, updated_at = NOW()
       WHERE id = $1 AND restaurant_id = $2
       RETURNING *`,
      [foodId, restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn.'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái món ăn thành công.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle food availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái món ăn.'
    });
  }
};

/**
 * Cập nhật thông tin restaurant
 */
const updateRestaurant = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const {
      name,
      description,
      address,
      phone,
      opening_hours,
      delivery_time,
      delivery_fee,
      minimum_order,
      latitude,
      longitude
    } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }
    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      params.push(description);
    }
    if (address !== undefined) {
      paramCount++;
      updates.push(`address = $${paramCount}`);
      params.push(address);
    }
    if (phone !== undefined) {
      paramCount++;
      updates.push(`phone = $${paramCount}`);
      params.push(phone);
    }
    if (opening_hours !== undefined) {
      paramCount++;
      updates.push(`opening_hours = $${paramCount}`);
      params.push(opening_hours);
    }
    if (delivery_time !== undefined) {
      paramCount++;
      updates.push(`delivery_time = $${paramCount}`);
      params.push(delivery_time);
    }
    if (delivery_fee !== undefined) {
      paramCount++;
      updates.push(`delivery_fee = $${paramCount}`);
      params.push(delivery_fee);
    }
    if (minimum_order !== undefined) {
      paramCount++;
      updates.push(`minimum_order = $${paramCount}`);
      params.push(minimum_order);
    }
    if (latitude !== undefined) {
      paramCount++;
      updates.push(`latitude = $${paramCount}`);
      params.push(latitude);
    }
    if (longitude !== undefined) {
      paramCount++;
      updates.push(`longitude = $${paramCount}`);
      params.push(longitude);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin nào được cập nhật.'
      });
    }

    paramCount++;
    updates.push(`updated_at = NOW()`);
    params.push(restaurantId);

    const query = `
      UPDATE restaurants 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, params);

    res.json({
      success: true,
      message: 'Cập nhật thông tin nhà hàng thành công.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin nhà hàng.'
    });
  }
};

/**
 * Lấy reviews của restaurant
 */
const getReviews = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT r.*,
        u.full_name as customer_name,
        u.avatar_url as customer_avatar
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.user_id
       WHERE r.restaurant_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [restaurantId, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM reviews WHERE restaurant_id = $1',
      [restaurantId]
    );

    const totalReviews = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalItems: totalReviews,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đánh giá.'
    });
  }
};

module.exports = {
  getMyRestaurant,
  getStatistics,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getFoods,
  createFood,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
  updateRestaurant,
  getReviews
};
