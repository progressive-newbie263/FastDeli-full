const express = require('express');
const router = express.Router();
const { supplierAuth, verifyRestaurantOwnership } = require('../middleware/supplierAuth');
const {
  getMyRestaurant,
  getStatistics,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getFoods,
  createFood,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
  updateRestaurant,
  getReviews
} = require('../controllers/supplierController');

/*
=======================================
    TẠM THỜI:
=======================================
  - Chỉ có các route này thôi. Chỉnh sửa / thêm bớt sau.
*/

// Get thông tin restaurant của supplier hiện tại
router.get('/my-restaurant', supplierAuth, getMyRestaurant);

// Get dashboard statistics
router.get('/restaurants/:restaurantId/statistics', 
  supplierAuth, 
  verifyRestaurantOwnership, 
  getStatistics
);

// Update restaurant info
router.patch('/restaurants/:restaurantId', 
  supplierAuth, 
  verifyRestaurantOwnership, 
  updateRestaurant
);

// Get reviews
router.get('/restaurants/:restaurantId/reviews', 
  supplierAuth, 
  verifyRestaurantOwnership, 
  getReviews
);

// ======================
// ORDERS ROUTES
// ======================

// Get all orders của restaurant
router.get('/restaurants/:restaurantId/orders', 
  supplierAuth, 
  verifyRestaurantOwnership, 
  getOrders
);

// Get order detail
router.get('/orders/:orderId', 
  supplierAuth, 
  getOrderById
);

// Update order status
router.patch('/orders/:orderId/status', 
  supplierAuth, 
  updateOrderStatus
);

// ======================
// FOODS ROUTES
// ======================

// Get all foods của restaurant
router.get('/restaurants/:restaurantId/foods', 
  supplierAuth, 
  verifyRestaurantOwnership, 
  getFoods
);

// Create new food
router.post('/restaurants/:restaurantId/foods', 
  supplierAuth, 
  verifyRestaurantOwnership, 
  createFood
);

// Update food
router.patch('/foods/:foodId', 
  supplierAuth, 
  updateFood
);

// Delete food
router.delete('/foods/:foodId', 
  supplierAuth, 
  deleteFood
);

// Toggle food availability
router.patch('/foods/:foodId/availability', 
  supplierAuth, 
  toggleFoodAvailability
);

module.exports = router;
