const { foodPool, sharedPool } = require('../config/db');
const { getNutritionFromUSDA } = require('../utils/usdaAPI');
const bcrypt = require('bcryptjs');

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

const DEFAULT_AVATAR_URL = process.env.DEFAULT_AVATAR_URL || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';
const DEFAULT_RESTAURANT_IMAGE_URL = process.env.DEFAULT_RESTAURANT_IMAGE_URL || 'https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg';

const geocodeAddress = async (address) => {
  const normalized = String(address || '').trim();
  if (!normalized) {
    return null;
  }

  const endpoint = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(normalized)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'FastDeli/1.0 (supplier-registration geocode)',
        'Accept-Language': 'vi',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (!first) {
      return null;
    }

    const latitude = Number(first.lat);
    const longitude = Number(first.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch (_) {
    return null;
  }
};

/*
  Đăng ký nhà hàng đối tác (public)
*/
const registerPartner = async (req, res) => {
  const {
    full_name,
    email,
    phone_number,
    password,
    restaurant_name,
    restaurant_address,
    restaurant_phone,
    description,
    image_url,
    delivery_time_min,
    delivery_time_max,
    min_order_value,
    delivery_fee,
    latitude,
    longitude,
  } = req.body || {};

  if (!full_name || !email || !phone_number || !password || !restaurant_name || !restaurant_address || !restaurant_phone) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin bắt buộc để đăng ký đối tác.',
    });
  }

  const sharedClient = await sharedPool.connect();
  const foodClient = await foodPool.connect();

  let createdUserId = null;

  try {
    await sharedClient.query('BEGIN');

    const emailCheck = await sharedClient.query('SELECT user_id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (emailCheck.rows.length > 0) {
      await sharedClient.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Email đã được sử dụng.',
      });
    }

    const phoneCheck = await sharedClient.query('SELECT user_id FROM users WHERE phone_number = $1 LIMIT 1', [phone_number]);
    if (phoneCheck.rows.length > 0) {
      await sharedClient.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Số điện thoại đã được sử dụng.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userInsert = await sharedClient.query(
      `INSERT INTO users (
        phone_number,
        email,
        password_hash,
        full_name,
        gender,
        date_of_birth,
        avatar_url,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'restaurant_owner')
      RETURNING user_id, full_name, email, phone_number, role`,
      [
        phone_number,
        email,
        passwordHash,
        full_name,
        'other',
        '1990-01-01',
        DEFAULT_AVATAR_URL,
      ]
    );

    createdUserId = userInsert.rows[0].user_id;
    await sharedClient.query('COMMIT');

    await foodClient.query('BEGIN');

    // Ensure SERIAL sequence is aligned with existing data to avoid duplicate PK on insert.
    await foodClient.query(
      `SELECT setval(
        pg_get_serial_sequence('restaurants', 'id'),
        COALESCE((SELECT MAX(id) FROM restaurants), 0) + 1,
        false
      )`
    );

    const columnResult = await foodClient.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'restaurants'`
    );
    const restaurantColumns = new Set((columnResult.rows || []).map((row) => row.column_name));
    const hasRestaurantEmail = restaurantColumns.has('email');
    const normalizedRestaurantImage =
      typeof image_url === 'string' &&
      image_url.trim().length > 0 &&
      image_url.trim().toLowerCase() !== 'null' &&
      image_url.trim().toLowerCase() !== 'undefined'
        ? image_url.trim()
        : DEFAULT_RESTAURANT_IMAGE_URL;

    const insertColumns = [
      'name',
      ...(hasRestaurantEmail ? ['email'] : []),
      'address',
      'phone',
      'image_url',
      'description',
      'delivery_time_min',
      'delivery_time_max',
      'min_order_value',
      'delivery_fee',
      'owner_id',
      'status',
      'created_at',
      'updated_at',
    ];

    const insertValues = [
      restaurant_name,
      ...(hasRestaurantEmail ? [email] : []),
      restaurant_address,
      restaurant_phone,
      normalizedRestaurantImage,
      description || null,
      Number.isFinite(Number(delivery_time_min)) ? Number(delivery_time_min) : 30,
      Number.isFinite(Number(delivery_time_max)) ? Number(delivery_time_max) : 45,
      Number(min_order_value || 0),
      Number(delivery_fee || 0),
      createdUserId,
      'pending',
    ];

    const placeholders = insertValues.map((_, index) => `$${index + 1}`);

    const restaurantInsert = await foodClient.query(
      `INSERT INTO restaurants (
        ${insertColumns.join(',\n        ')}
      )
      VALUES (${placeholders.join(', ')}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, status, owner_id, image_url`,
      insertValues
    );

    let restaurant = restaurantInsert.rows[0];

    // Extra safety: ensure newly registered restaurant never stores null/empty image.
    const ensuredRestaurantResult = await foodClient.query(
      `UPDATE restaurants
       SET image_url = COALESCE(NULLIF(TRIM(image_url), ''), $2)
       WHERE id = $1
       RETURNING id, name, status, owner_id, image_url`,
      [restaurant.id, DEFAULT_RESTAURANT_IMAGE_URL]
    );

    restaurant = ensuredRestaurantResult.rows[0] || restaurant;

    const normalizedLat = Number(latitude);
    const normalizedLng = Number(longitude);
    const hasManualCoords = Number.isFinite(normalizedLat) && Number.isFinite(normalizedLng);
    const geocoded = hasManualCoords ? null : await geocodeAddress(restaurant_address);
    const finalLat = hasManualCoords ? normalizedLat : geocoded?.latitude;
    const finalLng = hasManualCoords ? normalizedLng : geocoded?.longitude;

    if (Number.isFinite(finalLat) && Number.isFinite(finalLng)) {
      await foodClient.query(
        `INSERT INTO restaurant_locations (restaurant_id, latitude, longitude)
         VALUES ($1, $2, $3)
         ON CONFLICT (restaurant_id)
         DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude`,
        [restaurant.id, Number(finalLat), Number(finalLng)]
      );
    }

    await foodClient.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Đăng ký đối tác thành công. Nhà hàng đang chờ admin duyệt.',
      data: {
        user: userInsert.rows[0],
        restaurant,
      },
    });
  } catch (error) {
    try {
      await sharedClient.query('ROLLBACK');
    } catch (_) {
      // no-op
    }
    try {
      await foodClient.query('ROLLBACK');
    } catch (_) {
      // no-op
    }

    if (createdUserId) {
      try {
        await sharedPool.query('DELETE FROM users WHERE user_id = $1', [createdUserId]);
      } catch (cleanupErr) {
        console.error('Cleanup created user failed:', cleanupErr);
      }
    }

    console.error('Register partner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể đăng ký đối tác lúc này.',
    });
  } finally {
    sharedClient.release();
    foodClient.release();
  }
};

/*
  Lấy thông tin restaurant của supplier
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

/*
  Lấy thống kê dashboard cho supplier
*/
const getStatistics = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const requestedDays = Number(req.query?.days || 7);
    const chartDays = Number.isFinite(requestedDays)
      ? Math.min(Math.max(Math.floor(requestedDays), 1), 90)
      : 7;

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
         AND created_at >= CURRENT_DATE - ($2::int * INTERVAL '1 day')
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [restaurantId, chartDays]
    );

    const bestSellerResult = await foodPool.query(
      `SELECT
        oi.food_name,
        COALESCE(SUM(oi.quantity), 0) AS sold_quantity,
        COUNT(DISTINCT o.id) AS orders_count,
        COALESCE(SUM(oi.quantity * oi.food_price), 0) AS total_revenue
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE o.restaurant_id = $1
        AND o.order_status = 'delivered'
        AND o.created_at >= CURRENT_DATE - ($2::int * INTERVAL '1 day')
      GROUP BY oi.food_name
      ORDER BY sold_quantity DESC, orders_count DESC, total_revenue DESC
      LIMIT 8`,
      [restaurantId, chartDays]
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
        revenueChart: revenueChartResult.rows,
        best_sellers: (bestSellerResult.rows || []).map((row) => ({
          food_name: row.food_name,
          sold_quantity: Number(row.sold_quantity || 0),
          orders_count: Number(row.orders_count || 0),
          total_revenue: Number(row.total_revenue || 0),
        }))
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

/*
  Lấy danh sách đơn hàng của restaurant
*/
const getOrders = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { status, page = 1, limit = 10, search } = req.query;
    const { foodPool, sharedPool } = require('../config/db');

    let query = `
      SELECT o.*, o.id AS order_id,
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

    // lọc theo trạng thái đơn hàng
    if (status && status !== 'all') {
      paramCount++;
      query += ` AND o.order_status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (o.order_code ILIKE $${paramCount} OR o.id::text = $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY o.created_at DESC`;

    // phân trang
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await foodPool.query(query, params);
    
    // lấy ttin người dùng (shared-db-deli)
    const userIds = [...new Set(result.rows.map(r => r.user_id).filter(id => id))];
    let usersMap = new Map();
    if (userIds.length > 0) {
      const usersResult = await sharedPool.query(
        'SELECT user_id, full_name, phone_number, email FROM users WHERE user_id = ANY($1)',
        [userIds]
      );
      usersResult.rows.forEach(u => usersMap.set(u.user_id, u));
    }
    
    const enrichedOrders = result.rows.map(order => {
      const user = usersMap.get(order.user_id) || {};
      return {
        ...order,
        customer_name: user.full_name || order.user_name,
        customer_phone: user.phone_number || order.user_phone,
        customer_email: user.email
      };
    });

    // Tính tổng
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

/*
  Thông tin chi tiết đơn hàng
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

/*
  Cập nhật trạng thái đơn hàng
*/
const updateOrderStatus = async (req, res) => {
  const client = await foodPool.connect();
  try {
    const { orderId } = req.params;
    const status = String(req.body?.status || req.body?.order_status || '').trim().toLowerCase();
    const userId = req.user.userId;

    const allowedStatuses = ['processing', 'delivering', 'cancelled'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Nhà hàng chỉ có thể cập nhật sang processing, delivering hoặc cancelled.'
      });
    }

    await client.query('BEGIN');
    const checkResult = await client.query(
      `SELECT o.id, o.restaurant_id, o.order_status
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.id = $1 AND r.owner_id = $2
       FOR UPDATE`,
      [orderId, userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng.'
      });
    }

    const order = checkResult.rows[0];

    if (status === 'delivering') {
      const assignmentCheck = await client.query(
        `SELECT id
         FROM delivery_assignments
         WHERE order_id = $1
           AND status IN ('accepted', 'picking_up', 'delivering')
         LIMIT 1`,
        [orderId]
      );

      if (assignmentCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: 'Chưa có tài xế nhận đơn, không thể chuyển sang delivering.'
        });
      }
    }

    const transitionRules = {
      pending: ['processing', 'cancelled'],
      processing: ['delivering', 'cancelled'],
      delivering: ['cancelled'],
      delivered: [],
      cancelled: [],
    };

    const currentStatus = String(order.order_status || '').toLowerCase();
    const allowedNext = transitionRules[currentStatus] || [];

    if (!allowedNext.includes(status)) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Không thể chuyển trạng thái từ ${currentStatus} sang ${status}.`
      });
    }

    const result = await client.query(
      `UPDATE orders 
       SET order_status = $1, updated_at = NOW()
       WHERE id = $2 AND restaurant_id = $3
       RETURNING *`,
      [status, orderId, order.restaurant_id]
    );

    if (status === 'delivering') {
      await client.query(
        `UPDATE delivery_assignments
         SET status = 'delivering'
         WHERE order_id = $1
           AND status IN ('accepted', 'picking_up')`,
        [orderId]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công.',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng.'
    });
  } finally {
    client.release();
  }
};

/*
  Lấy danh sách món ăn của restaurant
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
    
    // Phân trang
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await foodPool.query(query, params);
    
    // Tổng số
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

/*
  Tạo món ăn mới
*/
const createFood = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { name, food_name, description, price, category_id, image_url, is_available = true } = req.body;
    const foodName = name ?? food_name;

    if (!foodName || !price) {
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
      [restaurantId, foodName, description, price, category_id, image_url, is_available]
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

/*
  Cập nhật món ăn
*/
const updateFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    const userId = req.user.userId;
    const { name, food_name, description, price, category_id, image_url, is_available } = req.body;
    const foodName = name ?? food_name;
    const { foodPool } = require('../config/db');

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

    if (foodName !== undefined) {
      paramCount++;
      updates.push(`food_name = $${paramCount}`);
      params.push(foodName);
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

/*
  Xóa món ăn
*/
const deleteFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    const userId = req.user.userId;
    const { foodPool } = require('../config/db');
    const { deleteImage } = require('../utils/cloudinary');

    const checkResult = await foodPool.query(
      `SELECT f.food_id, f.image_url, r.owner_id
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

    // Với quy ước public_id cố định khi upload, xóa theo food id sẽ giải phóng tài nguyên Cloudinary.
    if (checkResult.rows[0].image_url) {
      try {
        await deleteImage(`foods/food_${foodId}`);
      } catch (cloudinaryError) {
        const message = String(cloudinaryError?.message || '').toLowerCase();
        const isNotFound =
          cloudinaryError?.http_code === 404 ||
          message.includes('not found') ||
          message.includes('resource does not exist');

        if (!isNotFound) {
          throw cloudinaryError;
        }
      }
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

/*
  Toggle trạng thái món ăn
*/
const toggleFoodAvailability = async (req, res) => {
  try {
    const { foodId } = req.params;
    const userId = req.user.userId;
    const { foodPool } = require('../config/db');

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

/*
  Cập nhật thông tin restaurant
*/
const updateRestaurant = async (req, res) => {
  const sharedClient = await sharedPool.connect();
  const foodClient = await foodPool.connect();

  try {
    const restaurantId = req.restaurantId;
    const {
      name,
      email,
      description,
      address,
      phone,
      opening_hours,
      delivery_time_min,
      delivery_time_max,
      delivery_fee,
      min_order_value,
      minimum_order,
      latitude,
      longitude
    } = req.body;

    await sharedClient.query('BEGIN');
    await foodClient.query('BEGIN');

    const ownerResult = await foodClient.query(
      'SELECT owner_id FROM restaurants WHERE id = $1 LIMIT 1',
      [restaurantId]
    );

    if (!ownerResult.rows.length || !ownerResult.rows[0].owner_id) {
      await sharedClient.query('ROLLBACK');
      await foodClient.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà hàng hoặc owner hợp lệ.'
      });
    }

    const ownerId = Number(ownerResult.rows[0].owner_id);

    // Đồng bộ thông tin owner vào shared-db (nếu có trường thay đổi)
    const sharedUpdates = [];
    const sharedParams = [];
    let sharedParamCount = 0;

    const sharedColumnsResult = await sharedClient.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'users'`
    );
    const sharedColumns = new Set((sharedColumnsResult.rows || []).map((row) => row.column_name));

    if (name !== undefined && sharedColumns.has('full_name')) {
      sharedParamCount++;
      sharedUpdates.push(`full_name = $${sharedParamCount}`);
      sharedParams.push(name);
    }

    if (phone !== undefined && sharedColumns.has('phone_number')) {
      sharedParamCount++;
      sharedUpdates.push(`phone_number = $${sharedParamCount}`);
      sharedParams.push(phone);
    }

    if (email !== undefined && sharedColumns.has('email')) {
      sharedParamCount++;
      sharedUpdates.push(`email = $${sharedParamCount}`);
      sharedParams.push(email);
    }

    const usersAddressColumn = sharedColumns.has('address')
      ? 'address'
      : (sharedColumns.has('restaurant_address') ? 'restaurant_address' : null);
    if (address !== undefined && usersAddressColumn) {
      sharedParamCount++;
      sharedUpdates.push(`${usersAddressColumn} = $${sharedParamCount}`);
      sharedParams.push(address);
    }

    if (sharedUpdates.length > 0) {
      sharedUpdates.push('updated_at = NOW()');
      sharedParams.push(ownerId);
      await sharedClient.query(
        `UPDATE users
         SET ${sharedUpdates.join(', ')}
         WHERE user_id = $${sharedParams.length}`,
        sharedParams
      );
    }

    const restaurantColumnsResult = await foodClient.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'restaurants'`
    );
    const restaurantColumns = new Set((restaurantColumnsResult.rows || []).map((row) => row.column_name));

    const updates = [];
    const params = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }
    if (email !== undefined && restaurantColumns.has('email')) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      params.push(email);
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
    if (delivery_time_min !== undefined) {
      paramCount++;
      updates.push(`delivery_time_min = $${paramCount}`);
      params.push(Number(delivery_time_min));
    }
    if (delivery_time_max !== undefined) {
      paramCount++;
      updates.push(`delivery_time_max = $${paramCount}`);
      params.push(Number(delivery_time_max));
    }
    if (delivery_fee !== undefined) {
      paramCount++;
      updates.push(`delivery_fee = $${paramCount}`);
      params.push(delivery_fee);
    }
    const normalizedMinOrder = min_order_value ?? minimum_order;
    if (normalizedMinOrder !== undefined) {
      paramCount++;
      updates.push(`min_order_value = $${paramCount}`);
      params.push(Number(normalizedMinOrder));
    }
    const hasLocationUpdate =
      latitude !== undefined ||
      longitude !== undefined;

    if (updates.length === 0 && !hasLocationUpdate) {
      await sharedClient.query('ROLLBACK');
      await foodClient.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin nào được cập nhật.'
      });
    }

    let updatedRestaurant = null;

    if (updates.length > 0) {
      paramCount++;
      updates.push(`updated_at = NOW()`);
      params.push(restaurantId);

      const query = `
        UPDATE restaurants 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await foodClient.query(query, params);
      updatedRestaurant = result.rows[0] || null;
    }

    if (
      latitude !== undefined &&
      longitude !== undefined &&
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude))
    ) {
      await foodClient.query(
        `INSERT INTO restaurant_locations (restaurant_id, latitude, longitude)
         VALUES ($1, $2, $3)
         ON CONFLICT (restaurant_id)
         DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude`,
        [restaurantId, Number(latitude), Number(longitude)]
      );
    }

    if (!updatedRestaurant) {
      const fresh = await foodClient.query(
        `SELECT r.*, rl.latitude, rl.longitude
         FROM restaurants r
         LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
         WHERE r.id = $1
         LIMIT 1`,
        [restaurantId]
      );
      updatedRestaurant = fresh.rows[0] || null;
    }

    await sharedClient.query('COMMIT');
    await foodClient.query('COMMIT');

    res.json({
      success: true,
      message: 'Cập nhật thông tin nhà hàng thành công.',
      data: updatedRestaurant
    });
  } catch (error) {
    try {
      await sharedClient.query('ROLLBACK');
    } catch (_) {
      // no-op
    }
    try {
      await foodClient.query('ROLLBACK');
    } catch (_) {
      // no-op
    }

    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin nhà hàng.'
    });
  } finally {
    sharedClient.release();
    foodClient.release();
  }
};

const getReviews = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await foodPool.query(
      `SELECT r.*
       FROM reviews r
       WHERE r.restaurant_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [restaurantId, limit, offset]
    );

    const userIds = [...new Set(result.rows.map(r => r.user_id).filter(id => id))];
    let usersMap = new Map();
    if (userIds.length > 0) {
      const usersResult = await sharedPool.query(
        'SELECT user_id, full_name, avatar_url FROM users WHERE user_id = ANY($1)',
        [userIds]
      );
      usersResult.rows.forEach(u => usersMap.set(u.user_id, u));
    }

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
      data: {
        reviews: enrichedReviews,
      },
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

/*
  lấy thông tin dinh dưỡng của món ăn
  GET /api/supplier/foods/:foodId/nutrition
*/
const getFoodNutrition = async (req, res) => {
  try {
    const { foodId } = req.params;

    const result = await foodPool.query(
      `SELECT fn.*, f.food_name, f.restaurant_id
       FROM food_nutrition fn
       INNER JOIN foods f ON f.food_id = fn.food_id
       WHERE fn.food_id = $1`,
      [foodId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Món ăn chưa có thông tin dinh dưỡng'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get food nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin dinh dưỡng.'
    });
  }
};

/*
  Tạo hoặc cập nhật thông tin dinh dưỡng của món ăn (thử nghiệm, làm đơn giản)
  
  POST /api/supplier/foods/:foodId/nutrition
  
  Body: { calories, protein, fat, sugar, serving_size }
*/
const upsertFoodNutrition = async (req, res) => {
  try {
    const { foodId } = req.params;
    const {
      calories,
      protein,
      fat,
      sugar,
      serving_size
    } = req.body;

    const foodCheck = await foodPool.query(
      'SELECT food_id, restaurant_id FROM foods WHERE food_id = $1',
      [foodId]
    );

    if (foodCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn'
      });
    }

    const result = await foodPool.query(
      `INSERT INTO food_nutrition (
        food_id, calories, protein, fat, sugar, serving_size
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (food_id)
      DO UPDATE SET
        calories = EXCLUDED.calories,
        protein = EXCLUDED.protein,
        fat = EXCLUDED.fat,
        sugar = EXCLUDED.sugar,
        serving_size = EXCLUDED.serving_size,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [foodId, calories, protein, fat, sugar, serving_size]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin dinh dưỡng thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Upsert food nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu thông tin dinh dưỡng.'
    });
  }
};

/*
  Xóa thông tin dinh dưỡng của món ăn
  
  DELETE /api/supplier/foods/:foodId/nutrition
*/
const deleteFoodNutrition = async (req, res) => {
  try {
    const { foodId } = req.params;

    await foodPool.query(
      'DELETE FROM food_nutrition WHERE food_id = $1',
      [foodId]
    );

    res.json({
      success: true,
      message: 'Xóa thông tin dinh dưỡng thành công'
    });
  } catch (error) {
    console.error('Delete food nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông tin dinh dưỡng.'
    });
  }
};

/*
  Tự động tính nutrition từ tên món ăn (dùng USDA API)
  
  POST /api/supplier/foods/calculate-nutrition
  
  Body: { foodName: string }
*/
const calculateNutritionFromName = async (req, res) => {
  try {
    const { foodName } = req.body;

    if (!foodName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên món ăn'
      });
    }

    console.log(`[USDA] Tìm kiếm mức dinh dưỡng cho: "${foodName}"`);

    const nutritionData = await getNutritionFromUSDA(foodName);

    if (!nutritionData) {
      return res.json({
        success: false,
        message: `Không tìm thấy "${foodName}" trong USDA database.`,
        data: {
          suggestion: 'Vui lòng nhập thủ công hoặc thử tên món bằng tiếng Anh (e.g., "Chicken Rice", "Pho", "Pizza")'
        }
      });
    }

    console.log(`[USDA] Tìm thấy: ${nutritionData.food_name}`);

    res.json({
      success: true,
      message: `Tìm thấy thông tin dinh dưỡng cho "${nutritionData.food_name}"`,
      data: {
        food_name: nutritionData.food_name,
        serving_size: nutritionData.serving_size,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        fat: nutritionData.fat,
        sugar: nutritionData.sugar,
        source: 'USDA FoodData Central'
      }
    });
  } catch (error) {
    console.error('Calculate nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tính toán dinh dưỡng từ USDA API'
    });
  }
};

module.exports = {
  registerPartner,
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
  getReviews,
  getFoodNutrition,
  upsertFoodNutrition,
  deleteFoodNutrition,
  calculateNutritionFromName
};
