const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No or invalid auth token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account is disabled'
      });
    }

    req.user = user;
    req.userId = user.user_id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

module.exports = auth;
