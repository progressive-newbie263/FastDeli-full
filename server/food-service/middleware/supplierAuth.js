const jwt = require('jsonwebtoken');
const { foodPool, sharedPool } = require('../config/db');

/**
 * Middleware xác thực supplier/restaurant owner
 * Verify JWT token và kiểm tra role = 'restaurant_owner'
 */
const supplierAuth = (req, res, next) => {
  try {
    // Lấy token từ header - hỗ trợ nhiều format
    let token = req.headers.authorization || req.header('Authorization');
    
    console.log('[SupplierAuth] Request:', req.method, req.path);
    console.log('[SupplierAuth] Token detected:', token ? 'YES (' + token.substring(0, 10) + '...)' : 'NO');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.'
      });
    }
    
    // Remove 'Bearer ' prefix if exists
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('[SupplierAuth] Decoded:', decoded);
    
    // Kiểm tra role
    if (decoded.role !== 'restaurant_owner') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ chủ nhà hàng mới có quyền truy cập tính năng này.'
      });
    }

    // Gắn thông tin user vào request - Map id -> userId
    req.user = {
      userId: decoded.id || decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Supplier auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực.'
    });
  }
};

/**
 * Middleware xác thực supplier và verify ownership của restaurant
 * Phải được dùng sau supplierAuth middleware
 */
const verifyRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId || req.params.id;
    const userId = req.user.userId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID không được cung cấp.'
      });
    }

    // Import db ở đây để tránh circular dependency
    const db = require('../config/db');

    // Kiểm tra owner_id
    const result = await foodPool.query(
      'SELECT owner_id FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà hàng.'
      });
    }

    const restaurant = result.rows[0];

    if (restaurant.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập nhà hàng này.'
      });
    }

    // Gắn restaurantId vào request để dùng trong controller
    req.restaurantId = parseInt(restaurantId);
    next();
  } catch (error) {
    console.error('Verify restaurant ownership error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực quyền sở hữu nhà hàng.'
    });
  }
};

module.exports = {
  supplierAuth,
  verifyRestaurantOwnership
};
