const Coupon = require('../models/Coupons');
const { successResponse, errorResponse } = require('../utils/response');

class CouponController {
  static DEFAULT_COUPON_IMAGE_URL = 'https://res.cloudinary.com/dpldznnma/image/upload/v1759474917/discount-default-thumbnail.png';

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

      if (orderTotal < Number(coupon.min_order_value || 0)) {
        return errorResponse(
          res,
          `Đơn tối thiểu ${Number(coupon.min_order_value).toLocaleString('vi-VN')}đ để dùng coupon này`,
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

  static async getSupplierCoupons(req, res) {
    try {
      const restaurantId = Number(req.restaurantId || req.params.restaurantId);
      if (!restaurantId || Number.isNaN(restaurantId)) {
        return errorResponse(res, 'restaurantId không hợp lệ', null, 400);
      }

      const coupons = await Coupon.getByRestaurant(restaurantId);
      return successResponse(res, 'Lấy danh sách coupon nhà hàng thành công', {
        coupons,
        total: coupons.length,
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy coupon nhà hàng', error);
    }
  }

  static async createSupplierCoupon(req, res) {
    try {
      const restaurantId = Number(req.restaurantId || req.params.restaurantId);
      if (!restaurantId || Number.isNaN(restaurantId)) {
        return errorResponse(res, 'restaurantId không hợp lệ', null, 400);
      }

      const {
        code,
        title,
        description,
        discount_type,
        discount_value,
        min_order_value,
        max_discount,
        start_date,
        end_date,
        is_active,
        image_url,
      } = req.body || {};

      if (!code || !discount_type || discount_value === undefined || !start_date || !end_date) {
        return errorResponse(res, 'Thiếu thông tin coupon bắt buộc', null, 400);
      }

      if (!['percentage', 'fixed_amount'].includes(discount_type)) {
        return errorResponse(res, 'discount_type không hợp lệ', null, 400);
      }

      const discountValue = Number(discount_value);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        return errorResponse(res, 'discount_value phải lớn hơn 0', null, 400);
      }

      const createdCoupon = await Coupon.createForRestaurant({
        restaurantId,
        code,
        title,
        description,
        discountType: discount_type,
        discountValue,
        minOrderValue: Number(min_order_value || 0),
        maxDiscount: max_discount,
        startDate: start_date,
        endDate: end_date,
        isActive: is_active !== undefined ? Boolean(is_active) : true,
        imageUrl: image_url || CouponController.DEFAULT_COUPON_IMAGE_URL,
      });

      return successResponse(res, 'Tạo coupon nhà hàng thành công', createdCoupon, 201);
    } catch (error) {
      if (error && error.code === '23505') {
        return errorResponse(res, 'Mã coupon đã tồn tại', null, 409);
      }
      return errorResponse(res, 'Lỗi khi tạo coupon nhà hàng', error);
    }
  }

  static async updateSupplierCoupon(req, res) {
    try {
      const restaurantId = Number(req.restaurantId || req.params.restaurantId);
      const couponId = Number(req.params.couponId);

      if (!restaurantId || Number.isNaN(restaurantId)) {
        return errorResponse(res, 'restaurantId không hợp lệ', null, 400);
      }
      if (!couponId || Number.isNaN(couponId)) {
        return errorResponse(res, 'couponId không hợp lệ', null, 400);
      }

      const {
        code,
        title,
        description,
        discount_type,
        discount_value,
        min_order_value,
        max_discount,
        start_date,
        end_date,
        is_active,
        image_url,
      } = req.body || {};

      if (discount_type && !['percentage', 'fixed_amount'].includes(discount_type)) {
        return errorResponse(res, 'discount_type không hợp lệ', null, 400);
      }

      if (discount_value !== undefined) {
        const parsed = Number(discount_value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          return errorResponse(res, 'discount_value phải lớn hơn 0', null, 400);
        }
      }

      const updatedCoupon = await Coupon.updateForRestaurant({
        couponId,
        restaurantId,
        updates: {
          code,
          title,
          description,
          discount_type,
          discount_value,
          min_order_value,
          max_discount,
          start_date,
          end_date,
          is_active,
          image_url,
        },
      });

      if (!updatedCoupon) {
        return errorResponse(res, 'Không tìm thấy coupon để cập nhật', null, 404);
      }

      return successResponse(res, 'Cập nhật coupon nhà hàng thành công', updatedCoupon);
    } catch (error) {
      if (error && error.code === '23505') {
        return errorResponse(res, 'Mã coupon đã tồn tại', null, 409);
      }
      return errorResponse(res, 'Lỗi khi cập nhật coupon nhà hàng', error);
    }
  }
}

module.exports = CouponController;
