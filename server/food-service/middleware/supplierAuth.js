const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực supplier/restaurant owner
 * Verify JWT token và kiểm tra role = 'restaurant_owner'
 */
const supplierAuth = (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Kiểm tra role
    if (decoded.role !== 'restaurant_owner') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ chủ nhà hàng mới có quyền truy cập tính năng này.'
      });
    }

    // Gắn thông tin user vào request
    req.user = {
      userId: decoded.userId,
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
    const result = await db.query(
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
