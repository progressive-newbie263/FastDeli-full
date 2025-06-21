
const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const registerValidationRules = [
  // Phone number validation (Vietnamese phone number format)
  body('phone_number')
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .matches(/^(0|\+84)(\d{9,10})$/).withMessage('Số điện thoại không hợp lệ'),
  
  // Email validation
  body('email')
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ'),
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  // Full name validation
  body('full_name')
    .notEmpty().withMessage('Họ tên không được để trống')
    .isLength({ min: 2 }).withMessage('Họ tên phải có ít nhất 2 ký tự'),
  
  // Gender validation
  body('gender')
    .notEmpty().withMessage('Giới tính không được để trống')
    .isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
  
  // Date of birth validation
  body('date_of_birth')
    .notEmpty().withMessage('Ngày sinh không được để trống')
    .isDate().withMessage('Ngày sinh không hợp lệ')
];

// Validation rules for user login
const loginValidationRules = [
  // Email validation
  body('email')
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ'),
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
];

// Middleware to validate the request
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    success: false,
    errors: extractedErrors
  });
};

module.exports = {
  registerValidationRules,
  loginValidationRules,
  validate
};