const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  try {
    // token jwt từ header.
    const token = req.header('Authorization').replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No auth token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // dò user theo ID của họ
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account is disabled'
      });
    }

    // Add user to request object
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