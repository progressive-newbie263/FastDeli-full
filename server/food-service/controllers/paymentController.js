const Order = require('../models/Orders');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Payment Controller - Xử lý thanh toán cho đơn hàng
 * Học từ payment-gate: QR generation, webhook simulation
 */
class PaymentController {
  /**
   * POST /api/payments/create-session
   * Tạo payment session và trả về thông tin để generate QR
   */
  static async createPaymentSession(req, res) {
    try {
      const { order_id, bank_code } = req.body;

      if (!order_id) {
        return errorResponse(res, 'Thiếu order_id', null, 400);
      }

      // Lấy thông tin đơn hàng
      const order = await Order.getOrderById(order_id);
      if (!order) {
        return errorResponse(res, 'Không tìm thấy đơn hàng', null, 404);
      }

      // Kiểm tra đơn hàng đã thanh toán chưa
      if (order.payment_status === 'paid') {
        return errorResponse(res, 'Đơn hàng đã được thanh toán', null, 400);
      }

      // Thông tin payment session
      const paymentSession = {
        order_id: order.id,
        order_code: order.order_code,
        amount: parseFloat(order.total_amount),
        bank_code: bank_code || null,
        payment_method: 'qr_banking',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 phút
      };

      return successResponse(res, 'Tạo payment session thành công', paymentSession, 201);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi tạo payment session', error);
    }
  }

  /**
   * POST /api/payments/webhook
   * Webhook simulation - Giả lập callback từ payment gateway
   * Trong production thật sẽ verify signature từ VNPay/Momo
   */
  static async handleWebhook(req, res) {
    try {
      const { order_id, payment_status, transaction_id, bank_code } = req.body;

      if (!order_id || !payment_status) {
        return errorResponse(res, 'Thiếu thông tin webhook', null, 400);
      }

      // Lấy đơn hàng
      const order = await Order.getOrderById(order_id);
      if (!order) {
        return errorResponse(res, 'Không tìm thấy đơn hàng', null, 404);
      }

      // Kiểm tra trạng thái hiện tại
      if (order.payment_status === 'paid') {
        return successResponse(res, 'Đơn hàng đã được thanh toán trước đó', {
          order_id,
          status: 'already_paid',
        });
      }

      // Cập nhật trạng thái thanh toán
      let newOrderStatus = order.order_status;
      if (payment_status === 'paid' && order.order_status === 'pending') {
        newOrderStatus = 'pending'; // Tự động chuyển sang pending khi thanh toán (đơn hàng đang trong hàng chờ xử lí)
      }

      const updatedOrder = await Order.updatePaymentStatus(
        order_id,
        payment_status,
        newOrderStatus
      );

      // Log transaction info (trong production sẽ lưu vào bảng transactions)
      console.log(`💳 Payment webhook received:`, {
        order_id,
        order_code: order.order_code,
        payment_status,
        transaction_id,
        bank_code,
        amount: order.total_amount,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, 'Webhook processed successfully', {
        order_id: updatedOrder.id,
        order_code: updatedOrder.order_code,
        payment_status: updatedOrder.payment_status,
        order_status: updatedOrder.order_status,
        transaction_id,
      });
    } catch (error) {
      console.error('❌ Webhook error:', error);
      return errorResponse(res, 'Lỗi khi xử lý webhook', error);
    }
  }

  /**
   * GET /api/payments/status/:orderId
   * Kiểm tra trạng thái thanh toán của đơn hàng
   * Frontend sẽ polling endpoint này để check payment
   */
  static async getPaymentStatus(req, res) {
    try {
      const { orderId } = req.params;

      const order = await Order.getOrderById(orderId);
      if (!order) {
        return errorResponse(res, 'Không tìm thấy đơn hàng', null, 404);
      }

      return successResponse(res, 'Lấy trạng thái thanh toán thành công', {
        order_id: order.id,
        order_code: order.order_code,
        payment_status: order.payment_status,
        order_status: order.order_status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        updated_at: order.updated_at,
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy trạng thái thanh toán', error);
    }
  }

  /**
   * POST /api/payments/simulate
   * Endpoint để test - giả lập người dùng đã chuyển khoản
   * CHỈ dùng trong development/testing
   */
  static async simulatePayment(req, res) {
    try {
      const { order_id } = req.body;

      if (!order_id) {
        return errorResponse(res, 'Thiếu order_id', null, 400);
      }

      // Giả lập delay như thanh toán thật
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Gọi webhook với payment success
      const webhookPayload = {
        order_id,
        payment_status: 'paid',
        transaction_id: `TXN${Date.now()}`,
        bank_code: 'VCB',
        amount: 0, // Sẽ lấy từ order
      };

      // Gọi lại webhook handler
      const result = await PaymentController.handleWebhook(
        { body: webhookPayload },
        {
          json: (data) => data,
          status: () => ({ json: (data) => data }),
        }
      );

      return successResponse(res, '✅ Giả lập thanh toán thành công', result);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi giả lập thanh toán', error);
    }
  }
}

module.exports = PaymentController;
