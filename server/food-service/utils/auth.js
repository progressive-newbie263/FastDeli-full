const jwt = require('jsonwebtoken');
const { sharedPool } = require('../config/database');
const { errorResponse } = require('../utils/response');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, 'Token không được cung cấp', null, 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra user có tồn tại không
    const userQuery = 'SELECT * FROM users WHERE user_id = $1 AND is_active = true';
    const userResult = await sharedPool.query(userQuery, [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return errorResponse(res, 'Token không hợp lệ', null, 401);
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return errorResponse(res, 'Token không hợp lệ', error, 401);
  }
};

module.exports = auth;