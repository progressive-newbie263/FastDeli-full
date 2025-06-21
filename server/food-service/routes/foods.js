const express = require('express');
const router = express.Router();
const FoodController = require('../controllers/foodController');
const { validateFood } = require('../middleware/validation');
//const auth = require('../middleware/auth');

// Public routes
router.get('/', FoodController.getAllFoods);
router.get('/:id', FoodController.getFoodById);

// Protected routes (cần auth)
//router.post('/', auth, validateRestaurant, RestaurantController.createRestaurant);
//router.put('/:id', auth, validateRestaurant, RestaurantController.updateRestaurant);

module.exports = router;