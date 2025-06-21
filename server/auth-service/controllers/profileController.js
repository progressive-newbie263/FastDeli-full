const User = require('../models/userModel');
//import { generateToken } from '../utils/tokenGenerator.js';

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        phone_number: user.phone_number,
        email: user.email,
        full_name: user.full_name,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getCurrentUser
};