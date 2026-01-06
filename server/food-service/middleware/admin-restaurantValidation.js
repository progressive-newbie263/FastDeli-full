const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware xử lý validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation cho update status
 */
const validateUpdateStatus = [
  param('id').isInt().withMessage('ID nhà hàng phải là số nguyên'),
  body('status')
    .isIn(['active', 'inactive', 'pending', 'rejected'])
    .withMessage('Trạng thái không hợp lệ'),
  body('reason')
    .if(body('status').equals('rejected'))
    .notEmpty()
    .withMessage('Lý do từ chối là bắt buộc khi từ chối nhà hàng'),
  handleValidationErrors
];

/**
 * Validation cho reject restaurant
 */
const validateRejectRestaurant = [
  param('id').isInt().withMessage('ID nhà hàng phải là số nguyên'),
  body('reason')
    .notEmpty()
    .withMessage('Lý do từ chối là bắt buộc')
    .isLength({ min: 10 })
    .withMessage('Lý do từ chối phải có ít nhất 10 ký tự'),
  handleValidationErrors
];

/**
 * Validation cho get all với pagination
 */
const validateGetAll = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1-100'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'rejected'])
    .withMessage('Trạng thái không hợp lệ'),
  handleValidationErrors
];

module.exports = {
  validateUpdateStatus,
  validateRejectRestaurant,
  validateGetAll
};