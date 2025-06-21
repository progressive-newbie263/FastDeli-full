const Food = require('../models/Foods');
const { successResponse, errorResponse } = require('../utils/response');

class FoodController {
  static async getAllFoods(req, res) {
    try {
      const { search, is_featured, limit } = req.query;
      
      const filters = {};
      if (search) filters.search = search;
      if (is_featured) filters.is_featured = is_featured === 'true';
      if (limit) filters.limit = parseInt(limit);

      const foods = await Food.getAll(filters);
      
      return successResponse(res, 'Lấy danh sách món ăn thành công', {
        foods,
        total: foods.length
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách món ăn', error);
    }
  }

  static async getFoodById(req, res) {
    try {
      const { id } = req.params;
      const food = await Food.getById(id);

      if (!food) {
        return errorResponse(res, 'Không tìm thấy món ăn', null, 404);
      }

      return successResponse(res, 'Lấy thông tin món ăn thành công', food);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy thông tin món ăn', error);
    }
  }

  static async createFood(req, res) {
    try {
      const food = await Food.create(req.body);
      return successResponse(res, 'Tạo món ăn thành công', food, 201);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi tạo món ăn', error);
    }
  }

  static async updateFood(req, res) {
    try {
      const { id } = req.params;
      const food = await Food.update(id, req.body);

      if (!restaurant) {
        return errorResponse(res, 'Không tìm thấy món ăn', null, 404);
      }

      return successResponse(res, 'Cập nhật món ăn thành công', food);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi cập nhật món ăn', error);
    }
  }
}

module.exports = FoodController;