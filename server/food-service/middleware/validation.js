const Joi = require('joi');
const { errorResponse } = require('../utils/response');

const validateRestaurant = (req, res, next) => {
  const schema = Joi.object({
    restaurant_name: Joi.string().min(3).max(150).required(),
    address: Joi.string().min(10).max(255).required(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
    image_url: Joi.string().uri().optional(),
    description: Joi.string().max(1000).optional(),
    delivery_time: Joi.string().max(50).optional(),
    min_order_amount: Joi.number().min(0).optional(),
    delivery_fee: Joi.number().min(0).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return errorResponse(res, 'Dữ liệu không hợp lệ', error.details, 400);
  }

  next();
};

module.exports = { validateRestaurant };