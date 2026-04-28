const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { generateToken } = require('../utils/tokenGenerator');

const DRIVER_DEFAULT_SERVICES = ['food', 'delivery'];

const normalizeServices = (value, fallback = ['food']) => {
  const list = Array.isArray(value) ? value : [value];
  const cleaned = list
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase());

  const unique = [...new Set(cleaned)];
  return unique.length > 0 ? unique : fallback;
};

const serviceLabel = (service) => {
  if (service === 'food') {
    return 'FoodDeli';
  }

  if (service === 'delivery') {
    return 'ExpressDeli';
  }

  return service;
};

const buildRegisterHandler = (role, defaultServices = ['food']) => async (req, res) => {
  const {
    phone_number,
    email,
    password,
    full_name,
    gender,
    date_of_birth,
    service,
    confirmJoin = false
  } = req.body;

  const requestedServices = normalizeServices(service, defaultServices);

  const normalizedGender = gender ? String(gender).trim() : null;
  const normalizedDateOfBirth = date_of_birth ? String(date_of_birth).trim() : null;

  try {
    const existingUserByEmail = await User.findByEmail(email);

    if (existingUserByEmail) {
      // Check if user is trying to join a new service with an existing account
      const isPasswordMatch = await bcrypt.compare(password, existingUserByEmail.password_hash);
      
      if (isPasswordMatch) {
        const services = normalizeServices(existingUserByEmail.service, []);
        const missingServices = requestedServices.filter((item) => !services.includes(item));

        if (missingServices.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Tài khoản này đã được đăng ký đầy đủ dịch vụ yêu cầu.'
          });
        }

        const shouldAutoJoin = role === 'driver' || confirmJoin;

        if (shouldAutoJoin) {
          for (const missingService of missingServices) {
            await User.addServiceToUser(existingUserByEmail.user_id, missingService);
          }

          const token = generateToken(existingUserByEmail.user_id, existingUserByEmail.role);
          
          return res.status(200).json({
            success: true,
            message: `Đã kết nối tài khoản của bạn với ${missingServices.map(serviceLabel).join(' và ')}!`,
            token,
            user: {
              user_id: existingUserByEmail.user_id,
              phone_number: existingUserByEmail.phone_number,
              email: existingUserByEmail.email,
              full_name: existingUserByEmail.full_name,
              gender: existingUserByEmail.gender,
              date_of_birth: existingUserByEmail.date_of_birth,
              avatar_url: existingUserByEmail.avatar_url,
              role: existingUserByEmail.role,
              service: [...services, ...missingServices]
            }
          });
        } else {
          // Ask for confirmation
          return res.status(200).json({
            success: false,
            requireConfirmation: true,
            code: 'JOIN_SERVICE_REQUIRED',
            message: `Email này đã có tài khoản tại FastDeli. Bạn có muốn sử dụng tài khoản này để tham gia ${requestedServices.map(serviceLabel).join(' và ')} không?`
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Email này đã được sử dụng bởi một tài khoản khác.'
        });
      }
    }

    const existingUserByPhone = await User.findByPhone(phone_number);
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại này đã được sử dụng.'
      });
    }

    const user = await User.create({
      phone_number,
      email,
      password,
      full_name,
      gender: normalizedGender,
      date_of_birth: normalizedDateOfBirth,
      role,
      service: requestedServices
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
        role: user.role,
        service: user.service
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
const registerDriver = buildRegisterHandler('driver', DRIVER_DEFAULT_SERVICES);

module.exports = {
  register,
  registerDriver
};