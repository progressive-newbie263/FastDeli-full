const User = require('../models/userModel');
const { generateToken } = require('../utils/tokenGenerator');

const buildRegisterHandler = (role) => async (req, res) => {
  const {
    phone_number,
    email,
    password,
    full_name,
    gender,
    date_of_birth
  } = req.body;

  const normalizedGender = gender ? String(gender).trim() : null;
  const normalizedDateOfBirth = date_of_birth ? String(date_of_birth).trim() : null;

  try {
    const existingUserByPhone = await User.findByPhone(phone_number);
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã được sử dụng'
      });
    }

    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    const user = await User.create({
      phone_number,
      email,
      password,
      full_name,
      gender: normalizedGender,
      date_of_birth: normalizedDateOfBirth,
      role
    });

    const token = generateToken(user.user_id, user.role);

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
        avatar_url: user.avatar_url,
        role: user.role
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

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = buildRegisterHandler('customer');

// @desc    Register a new driver
// @route   POST /api/auth/register-driver
// @access  Public
const registerDriver = buildRegisterHandler('driver');

module.exports = {
  register,
  registerDriver
};