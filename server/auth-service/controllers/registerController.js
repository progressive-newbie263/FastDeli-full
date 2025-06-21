const User = require('../models/userModel');
const { generateToken } = require('../utils/tokenGenerator');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { phone_number, email, password, full_name, gender, date_of_birth } = req.body;

  try {
    // đăng kí thì check xem sđt đã đc đăng kí trước đó chưa.
    const existingUserByPhone = await User.findByPhone(phone_number);
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã được sử dụng'
      });
    }

    // đăng kí thì check xem email đã đc đăng kí trước đó chưa.
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // tạo người dùng mới
    const user = await User.create({
      phone_number,
      email,
      password,
      full_name,
      gender,
      date_of_birth
    });

    // role mặc định là user
    await User.createUserRole(user.user_id);

    // token jwt.
    const token = generateToken(user.user_id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      token,
      user: {
        user_id: user.user_id,
        phone_number: user.phone_number,
        email: user.email,
        full_name: user.full_name,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi, vui lòng thử lại sau',
      error: error.message
    });
  }
};

module.exports = {
  register
};