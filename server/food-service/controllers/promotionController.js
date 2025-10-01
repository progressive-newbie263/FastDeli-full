const Promotion = require('../models/Promotions');
const { successResponse, errorResponse } = require('../utils/response');

class PromotionController {
  // Lấy tất cả promotions (GET /promotions)
  static async getAllPromotions(req, res) {
    try {
      const { restaurant_id, day_of_week, is_active, limit } = req.query;

      const filters = {};
      if (restaurant_id) filters.restaurant_id = parseInt(restaurant_id);
      if (day_of_week) filters.day_of_week = parseInt(day_of_week);
      if (is_active) filters.is_active = is_active === 'true';
      if (limit) filters.limit = parseInt(limit);

      const promotions = await Promotion.getAll(filters);

      return successResponse(res, 'Lấy danh sách khuyến mãi thành công', {
        promotions,
        total: promotions.length
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách khuyến mãi', error);
    }
  }

  // Lấy chi tiết 1 promotion theo id (GET /promotions/:id)
  static async getPromotionById(req, res) {
    try {
      const { id } = req.params;
      const promotion = await Promotion.getById(id);

      if (!promotion) {
        return errorResponse(res, 'Không tìm thấy khuyến mãi', null, 404);
      }

      return successResponse(res, 'Lấy chi tiết khuyến mãi thành công', promotion);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy chi tiết khuyến mãi', error);
    }
  }

  // Tạo mới promotion (POST /promotions)
  static async createPromotion(req, res) {
    try {
      const promotion = await Promotion.create(req.body);
      return successResponse(res, 'Tạo khuyến mãi thành công', promotion, 201);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi tạo khuyến mãi', error);
    }
  }

  // Cập nhật promotion (PUT /promotions/:id)
  static async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const promotion = await Promotion.update(id, req.body);

      if (!promotion) {
        return errorResponse(res, 'Không tìm thấy khuyến mãi', null, 404);
      }

      return successResponse(res, 'Cập nhật khuyến mãi thành công', promotion);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi cập nhật khuyến mãi', error);
    }
  }

  // Xóa promotion (DELETE /promotions/:id)
  static async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Promotion.delete(id);

      if (!deleted) {
        return errorResponse(res, 'Không tìm thấy khuyến mãi để xóa', null, 404);
      }

      return successResponse(res, 'Xóa khuyến mãi thành công', { deleted_id: id });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi xóa khuyến mãi', error);
    }
  }
}

module.exports = PromotionController;
