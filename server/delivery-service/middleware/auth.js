const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    // Using simple verify. In a real app, secret would be shared via env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // We assume the token payload contains user_id and optionally service info
    // For this demo, if token is valid, we allow access
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error('Delivery Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.'
    });
  }
};

module.exports = auth;
