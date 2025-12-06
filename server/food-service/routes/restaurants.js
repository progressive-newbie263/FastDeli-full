const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/restaurantController');
//const { validateRestaurant } = require('../middleware/validation');
//const auth = require('../middleware/auth');

// Middleware cache headers
const addCacheHeaders = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.set('Vary', 'Accept-Encoding');
  next();
};

// Public routes với cache
router.get('/', addCacheHeaders, RestaurantController.getAllRestaurants);
router.get('/:id', addCacheHeaders, RestaurantController.getRestaurantById);
router.get('/:id/foods', addCacheHeaders, RestaurantController.getFoodsByRestaurant);

// Protected routes (cần auth)
//router.post('/', auth, validateRestaurant, RestaurantController.createRestaurant);
//router.put('/:id', auth, validateRestaurant, RestaurantController.updateRestaurant);

module.exports = router;