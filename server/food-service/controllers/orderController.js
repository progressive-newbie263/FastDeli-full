const Order = require('../models/Orders');
const { successResponse, errorResponse } = require('../utils/response');

class OrderController {
  // Tạo đơn hàng mới
  static async createOrder(req, res) {
    try {
      const { orderData, items } = req.body;

      if (!orderData || !items || !items.length) {
        return errorResponse(res, 'Thiếu thông tin đơn hàng hoặc items', null, 400);
      }

      const order = await Order.createOrder(orderData, items);
      return successResponse(res, 'Tạo đơn hàng thành công', order, 201);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi tạo đơn hàng', error);
    }
  }

  // Lấy đơn hàng theo ID
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.getOrderById(id);

      if (!order) {
        return errorResponse(res, 'Không tìm thấy đơn hàng', null, 404);
      }

      return successResponse(res, 'Lấy thông tin đơn hàng thành công', order);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy đơn hàng', error);
    }
  }

  // Lấy tất cả đơn hàng của một người dùng (lấy mọi đơn hàng có chung "user_id")
  static async getOrdersByUserId(req, res) {
    try {
      const { userId } = req.params; // Lấy userId từ URL params

      if (!userId) {
        return errorResponse(res, 'Thiếu userId', null, 400);
      }

      const orders = await Order.getOrdersByUserId(userId);

      return successResponse(
        res,
        'Lấy danh sách đơn hàng thành công',
        orders
      );
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách đơn hàng', error);
    }
  }


  // Lấy tất cả đơn hàng (tạm thời chưa viết)
  // static async getAllOrders(req, res) {}

  // Cập nhật trạng thái thanh toán
  static async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { payment_status, order_status } = req.body;

      const order = await Order.updatePaymentStatus(id, payment_status, order_status);

      if (!order) {
        return errorResponse(res, 'Không tìm thấy đơn hàng để cập nhật', null, 404);
      }

      return successResponse(res, 'Cập nhật trạng thái thanh toán thành công', order);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi cập nhật trạng thái thanh toán', error);
    }
  }

  // hủy đơn hàng/cancel order
  static async cancelOrder(req, res) {
    try {
      const updated = await Order.cancelOrder(req.params.id);

      if (!updated) {
        return errorResponse(res, 'Không tìm thấy đơn hàng', null, 404);
      }

      return successResponse(res, 'Hủy đơn hàng thành công', updated);
    } catch (err) {
      if (err.message === 'NOT_FOUND')
        return errorResponse(res, 'Không tìm thấy đơn hàng', null, 404);
      if (err.message === 'ALREADY_PROCESSED')
        return errorResponse(res, 'Đơn hàng đã được xử lý/hủy', null, 400);
      if (err.message === 'EXPIRED')
        return errorResponse(res, 'Đơn hàng đã quá thời gian hủy', null, 400);

      console.error('[cancelOrder] Lỗi:', err);
      return errorResponse(res, 'Lỗi server khi hủy đơn hàng', err);
    }
  }
}

module.exports = OrderController;
