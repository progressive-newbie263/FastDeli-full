const Coupon = require('../models/Coupons');
const { successResponse, errorResponse } = require('../utils/response');

class CouponController {
  static async getAvailableCoupons(req, res) {
    try {
      const restaurantId = req.query.restaurant_id ? Number(req.query.restaurant_id) : null;
      const coupons = await Coupon.getAvailable({ restaurantId });

      return successResponse(res, 'Lấy danh sách coupon thành công', {
        coupons,
        total: coupons.length,
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách coupon', error);
    }
  }

  static async validateCoupon(req, res) {
    try {
      const { code, restaurant_id, order_total } = req.body;

      if (!code) {
        return errorResponse(res, 'Thiếu mã coupon', null, 400);
      }

      const orderTotal = Number(order_total || 0);
      const restaurantId = restaurant_id ? Number(restaurant_id) : null;

      const coupon = await Coupon.getByCode({ code, restaurantId });
      if (!coupon) {
        return errorResponse(res, 'Coupon không hợp lệ hoặc đã hết hạn', null, 404);
      }

      if (orderTotal < Number(coupon.min_order_amount || 0)) {
        return errorResponse(
          res,
          `Đơn tối thiểu ${Number(coupon.min_order_amount).toLocaleString('vi-VN')}đ để dùng coupon này`,
          null,
          400
        );
      }

      const discountAmount = Coupon.calculateDiscount(coupon, orderTotal);

      return successResponse(res, 'Coupon hợp lệ', {
        coupon,
        discount_amount: discountAmount,
        final_total: Math.max(orderTotal - discountAmount, 0),
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi validate coupon', error);
    }
  }
}

module.exports = CouponController;
