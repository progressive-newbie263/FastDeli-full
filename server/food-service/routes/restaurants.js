const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/restaurantController');
//const { validateRestaurant } = require('../middleware/validation');
//const auth = require('../middleware/auth');

// Public routes
router.get('/', RestaurantController.getAllRestaurants);
router.get('/:id', RestaurantController.getRestaurantById);
router.get('/:id/foods', RestaurantController.getFoodsByRestaurant);

// Protected routes (cần auth)
//router.post('/', auth, validateRestaurant, RestaurantController.createRestaurant);
//router.put('/:id', auth, validateRestaurant, RestaurantController.updateRestaurant);

module.exports = router;