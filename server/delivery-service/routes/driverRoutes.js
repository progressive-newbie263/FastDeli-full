const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { driverAuth } = require('../middleware/driverAuth');

router.use(driverAuth);

router.get('/me', driverController.getMe);
router.post('/create-profile', driverController.createProfile);
router.patch('/status', driverController.updateStatus);

// Vị trí thời gian thực
router.post('/location', driverController.updateLocation);

// Đơn khả dụng và hành động tài xế
router.get('/available-orders', driverController.getAvailableOrders);
router.post('/orders/:orderId/accept', driverController.acceptOrder);
router.post('/orders/:orderId/reject', driverController.rejectOrder);
router.post('/orders/:orderId/delivered', driverController.markAsDelivered);

// Route tương thích ngược với client cũ
router.post('/accept-order', driverController.acceptOrder);
router.post('/mark-delivered', driverController.markAsDelivered);

// Đơn hàng của tài xế + ví
router.get('/my-orders', driverController.getMyOrders);
router.get('/wallet/summary', driverController.getWalletSummary);

module.exports = router;
