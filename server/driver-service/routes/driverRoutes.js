const express = require('express');
const DriverController = require('../controllers/driverController');
const driverAuth = require('../middleware/driverAuth');

const router = express.Router();

// Driver registration: tạo tài khoản role=driver nhưng is_active=false (chờ admin duyệt)
router.post('/register', DriverController.registerDriver);

// Cập nhật vị trí tài xế
router.post('/location', driverAuth, DriverController.updateLocation);

// Lấy danh sách đơn đang ở state "delivering" được gán cho tài xế
router.get('/orders/delivering', driverAuth, DriverController.getDeliveringOrders);

// Lấy dữ liệu map (nhà hàng, khách hàng, các "tài xế ảo" + candidate được chọn)
router.get('/orders/:orderId/map', driverAuth, DriverController.getOrderMap);

// Xác nhận giao xong: delivering -> delivered
router.post('/orders/:orderId/confirm-delivered', driverAuth, DriverController.confirmDelivered);

module.exports = router;

