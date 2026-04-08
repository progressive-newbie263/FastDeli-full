const jwt = require('jsonwebtoken');

const driverAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Thiếu token xác thực.',
      });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (decoded.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ tài xế mới có quyền truy cập API này.',
      });
    }

    req.user = {
      userId: Number(decoded.id || decoded.userId),
      role: decoded.role,
    };

    if (!Number.isInteger(req.user.userId) || req.user.userId <= 0) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ.',
      });
    }

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token đã hết hạn.' : 'Token không hợp lệ.',
    });
  }
};

module.exports = {
  driverAuth,
};
