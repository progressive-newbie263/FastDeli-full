const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generate JWT token
 * @param {number} userId - User ID
 * @param {string} role - User role (customer, restaurant_owner, admin, shipper)
 * @returns {string} JWT token
 */

const generateToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

module.exports = {
  generateToken
};