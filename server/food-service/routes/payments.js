const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

/**
 * Payment Routes - Xử lý thanh toán QR Banking
 * Flow: Create session → Generate QR → Webhook callback → Update DB
 */

// POST: Tạo payment session (trước khi hiển thị QR)
router.post('/create-session', PaymentController.createPaymentSession);

// POST: Webhook nhận callback từ payment gateway (hoặc simulation)
router.post('/webhook', PaymentController.handleWebhook);

// GET: Kiểm tra trạng thái thanh toán (polling từ frontend)
router.get('/status/:orderId', PaymentController.getPaymentStatus);

// POST: Simulate payment (CHỈ dùng trong development)
router.post('/simulate', PaymentController.simulatePayment);

module.exports = router;
