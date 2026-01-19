const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { generateToken } = require('../utils/tokenGenerator');
const { Pool } = require('pg');

// Food database pool để query restaurant info
const foodPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.FOOD_DB_NAME || 'db-food-deli',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    const token = generateToken(user.user_id, user.role); 

    // Chuẩn bị response user data
    const userData = {
      user_id: user.user_id,
      phone_number: user.phone_number,
      email: user.email,
      full_name: user.full_name,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      avatar_url: user.avatar_url,
      role: user.role  
    };

    // Nếu user là restaurant_owner, lấy thêm restaurant_id
    if (user.role === 'restaurant_owner') {
      try {
        const restaurantResult = await foodPool.query(
          'SELECT id, name, status FROM restaurants WHERE owner_id = $1 LIMIT 1',
          [user.user_id]
        );

        if (restaurantResult.rows.length > 0) {
          const restaurant = restaurantResult.rows[0];
          userData.restaurant_id = restaurant.id;
          userData.restaurant_name = restaurant.name;
          userData.restaurant_status = restaurant.status;
        }
      } catch (error) {
        console.error('Error fetching restaurant info:', error);
        // Không fail login nếu không tìm thấy restaurant
      }
    }

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi, vui lòng thử lại sau',
      error: error.message
    });
  }
};

module.exports = {
  login,
};