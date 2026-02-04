const { foodPool, sharedPool } = require('../config/db');

const buildUsersMap = async (userIds) => {
  if (!userIds.length) {
    return new Map();
  }

  const result = await sharedPool.query(
    `SELECT user_id, full_name, phone_number, email, avatar_url
     FROM users
     WHERE user_id = ANY($1)`
    , [userIds]
  );

  const map = new Map();
  result.rows.forEach((row) => {
    map.set(row.user_id, row);
  });

  return map;
};

/**
 * Lấy thông tin restaurant của supplier
 */
const getMyRestaurant = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await foodPool.query(
      `SELECT r.*, 
        rl.longitude,
        rl.latitude,
        (SELECT COUNT(*) FROM foods WHERE restaurant_id = r.id) as total_foods,
        (SELECT COUNT(*) FROM orders WHERE restaurant_id = r.id) as total_orders,
        (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id) as avg_rating
       FROM restaurants r
       LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
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
    const revenueResult = await foodPool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders 
       WHERE restaurant_id = $1 AND order_status = 'delivered'`,
      [restaurantId]
    );

    // Số lượng đơn hàng
    const ordersResult = await foodPool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN order_status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN order_status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN order_status = 'delivering' THEN 1 END) as delivering_orders,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders
       FROM orders 
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    // Số lượng món ăn
    const foodsResult = await foodPool.query(
      `SELECT 
        COUNT(*) as total_foods,
        COUNT(CASE WHEN is_available = true THEN 1 END) as available_foods,
        COUNT(CASE WHEN is_available = false THEN 1 END) as unavailable_foods
       FROM foods 
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    // Đánh giá trung bình
    const ratingResult = await foodPool.query(
      `SELECT 
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as total_reviews
       FROM reviews 
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    // Doanh thu theo ngày (7 ngày gần nhất)
    const revenueChartResult = await foodPool.query(
      `SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders_count
       FROM orders
       WHERE restaurant_id = $1 
         AND order_status = 'delivered'
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
    const { foodPool, sharedPool } = require('../config/db');

    let query = `
      SELECT o.*, 
        (SELECT json_agg(json_build_object(
          'order_item_id', oi.order_item_id,
          'food_name', oi.food_name,
          'quantity', oi.quantity,
          'food_price', oi.food_price
        ))
        FROM order_items oi
        WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      WHERE o.restaurant_id = $1
    `;

    const params = [restaurantId];
    let paramCount = 1;

    // Filter by status
    if (status && status !== 'all') {
      paramCount++;
      query += ` AND o.order_status = $${paramCount}`;
      params.push(status);
    }

    // Search by order code or ID
    if (search) {
      paramCount++;
      query += ` AND (o.order_code ILIKE $${paramCount} OR o.id::text = $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY o.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await foodPool.query(query, params);
    
    // Fetch user info từ shared DB
    const userIds = [...new Set(result.rows.map(r => r.user_id).filter(id => id))];
    let usersMap = new Map();
    if (userIds.length > 0) {
      const usersResult = await sharedPool.query(
        'SELECT user_id, full_name, phone_number, email FROM users WHERE user_id = ANY($1)',
        [userIds]
      );
      usersResult.rows.forEach(u => usersMap.set(u.user_id, u));
    }
    
    // Enrich orders with customer info
    const enrichedOrders = result.rows.map(order => {
      const user = usersMap.get(order.user_id) || {};
      return {
        ...order,
        customer_name: user.full_name || order.user_name,
        customer_phone: user.phone_number || order.user_phone,
        customer_email: user.email
      };
    });

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM orders o
      WHERE o.restaurant_id = $1
    `;
    const countParams = [restaurantId];
    let countParamIndex = 1;

    if (status && status !== 'all') {
      countParamIndex++;
      countQuery += ` AND o.order_status = $${countParamIndex}`;
      countParams.push(status);
    }

    if (search) {
      countParamIndex++;
      countQuery += ` AND (o.order_code ILIKE $${countParamIndex} OR o.id::text = $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await foodPool.query(countQuery, countParams);
    const totalOrders = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        orders: enrichedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalItems: totalOrders,
          itemsPerPage: parseInt(limit)
        }
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
    const userId = req.user.userId;
    const { foodPool, sharedPool } = require('../config/db');

    // Kiểm tra ownership
    const ownershipResult = await foodPool.query(
      `SELECT o.*, r.owner_id,
        (SELECT json_agg(json_build_object(
          'order_item_id', oi.order_item_id,
          'food_id', oi.food_id,
          'food_name', oi.food_name,
          'quantity', oi.quantity,
          'food_price', oi.food_price
        ))
        FROM order_items oi
        WHERE oi.order_id = o.id
        ) as items
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng.'
      });
    }

    const order = ownershipResult.rows[0];

    if (order.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập đơn hàng này.'
      });
    }

    // Lấy thông tin customer
    const userResult = await sharedPool.query(
      'SELECT user_id, full_name, phone_number, email FROM users WHERE user_id = $1',
      [order.user_id]
    );

    const customer = userResult.rows[0];
    const responseData = {
      ...order,
      customer_name: customer?.full_name || order.user_name,
      customer_phone: customer?.phone_number || order.user_phone,
      customer_email: customer?.email
    };

    res.json({
      success: true,
      data: responseData
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
    const { foodPool } = require('../config/db');
    const checkResult = await foodPool.query(
      'SELECT order_status FROM orders WHERE id = $1 AND restaurant_id = $2',
      [orderId, restaurantId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng.'
      });
    }

    // Update status
    const result = await foodPool.query(
      `UPDATE orders 
       SET order_status = $1, updated_at = NOW()
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
    const { category, search, is_available, page = 1, limit = 100 } = req.query;
    const { foodPool } = require('../config/db');

    let query = `
      SELECT f.*,
        fc.category_name as category_name
      FROM foods f
      LEFT JOIN food_categories fc ON f.primary_category_id = fc.category_id
      WHERE f.restaurant_id = $1
    `;

    const params = [restaurantId];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND f.primary_category_id = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND f.food_name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    if (is_available !== undefined) {
      paramCount++;
      query += ` AND f.is_available = $${paramCount}`;
      params.push(is_available === 'true');
    }

    query += ` ORDER BY f.created_at DESC`;
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await foodPool.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM foods f WHERE f.restaurant_id = $1`;
    const countParams = [restaurantId];
    let countParamIndex = 1;
    
    if (category) {
      countParamIndex++;
      countQuery += ` AND f.primary_category_id = $${countParamIndex}`;
      countParams.push(category);
    }
    
    if (search) {
      countParamIndex++;
      countQuery += ` AND f.food_name ILIKE $${countParamIndex}`;
      countParams.push(`%${search}%`);
    }
    
    if (is_available !== undefined) {
      countParamIndex++;
      countQuery += ` AND f.is_available = $${countParamIndex}`;
      countParams.push(is_available === 'true');
    }
    
    const countResult = await foodPool.query(countQuery, countParams);
    const totalFoods = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        foods: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.max(1, Math.ceil(totalFoods / parseInt(limit))),
          totalItems: totalFoods,
          itemsPerPage: parseInt(limit)
        }
      }
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

    const { foodPool } = require('../config/db');
    const result = await foodPool.query(
      `INSERT INTO foods (restaurant_id, food_name, description, price, primary_category_id, image_url, is_available, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
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
    const userId = req.user.userId;
    const { name, description, price, category_id, image_url, is_available } = req.body;
    const { foodPool } = require('../config/db');

    // Verify food belongs to restaurant
    const checkResult = await foodPool.query(
      `SELECT f.food_id, f.restaurant_id, r.owner_id
       FROM foods f
       JOIN restaurants r ON f.restaurant_id = r.id
       WHERE f.food_id = $1`,
      [foodId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn.'
      });
    }

    if (checkResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật món ăn này.'
      });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`food_name = $${paramCount}`);
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
      updates.push(`primary_category_id = $${paramCount}`);
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

    params.push(foodId);

    const query = `
      UPDATE foods 
      SET ${updates.join(', ')}
      WHERE food_id = $${params.length}
      RETURNING *
    `;

    const result = await foodPool.query(query, params);

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
    const userId = req.user.userId;
    const { foodPool } = require('../config/db');

    // Verify food belongs to restaurant
    const checkResult = await foodPool.query(
      `SELECT f.food_id, r.owner_id
       FROM foods f
       JOIN restaurants r ON f.restaurant_id = r.id
       WHERE f.food_id = $1`,
      [foodId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn.'
      });
    }

    if (checkResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa món ăn này.'
      });
    }

    await foodPool.query(
      'DELETE FROM foods WHERE food_id = $1',
      [foodId]
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
    const userId = req.user.userId;
    const { foodPool } = require('../config/db');

    // Verify ownership
    const ownershipResult = await foodPool.query(
      `SELECT f.food_id, r.owner_id
       FROM foods f
       JOIN restaurants r ON f.restaurant_id = r.id
       WHERE f.food_id = $1`,
      [foodId]
    );

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn.'
      });
    }

    if (ownershipResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật món ăn này.'
      });
    }

    const result = await foodPool.query(
      `UPDATE foods 
       SET is_available = NOT is_available
       WHERE food_id = $1
       RETURNING *`,
      [foodId]
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

    const result = await foodPool.query(query, params);

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

    // Get reviews from food DB
    const result = await foodPool.query(
      `SELECT r.*
       FROM reviews r
       WHERE r.restaurant_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [restaurantId, limit, offset]
    );
    
    // Get user info from shared DB
    const userIds = [...new Set(result.rows.map(r => r.user_id).filter(id => id))];
    let usersMap = new Map();
    if (userIds.length > 0) {
      const usersResult = await sharedPool.query(
        'SELECT user_id, full_name, avatar_url FROM users WHERE user_id = ANY($1)',
        [userIds]
      );
      usersResult.rows.forEach(u => usersMap.set(u.user_id, u));
    }
    
    // Enrich reviews with user info
    const enrichedReviews = result.rows.map(review => {
      const user = usersMap.get(review.user_id) || {};
      return {
        ...review,
        customer_name: user.full_name,
        customer_avatar: user.avatar_url
      };
    });

    const countResult = await foodPool.query(
      'SELECT COUNT(*) FROM reviews WHERE restaurant_id = $1',
      [restaurantId]
    );

    const totalReviews = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: enrichedReviews,
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
