const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');


//GET: Lấy mọi đơn hàng (cho admin)
router.get('/', OrderController.getAllOrders);

// PATCH: Cập nhật trạng thái đơn hàng (cho admin)
//router.patch('/:id/status', OrderController.updateOrderStatus);

// POST: Tạo đơn hàng
router.post('/', OrderController.createOrder);

// GET: Lấy tất cả đơn hàng của một người dùng (lọc theo id người dùng).
router.get('/user/:userId', OrderController.getOrdersByUserId);

// GET: Lấy đơn hàng theo ID
router.get('/:id', OrderController.getOrderById);

// PATCH: Cập nhật trạng thái thanh toán
router.patch('/:id/payment', OrderController.updatePaymentStatus);

// PATCH: hủy đơn hàng.
router.patch('/:id/cancel', OrderController.cancelOrder);


module.exports = router;
