const Restaurant = require('../models/Restaurants');
const { successResponse, errorResponse } = require('../utils/response');

class RestaurantController {
  static async getAllRestaurants(req, res) {
    try {
      const { search, is_featured, limit } = req.query;
      
      const filters = {};
      if (search) filters.search = search;
      if (is_featured) filters.is_featured = is_featured === 'true';
      if (limit) filters.limit = parseInt(limit);

      const restaurants = await Restaurant.getAll(filters);
      
      return successResponse(res, 'Lấy danh sách nhà hàng thành công', {
        restaurants,
        total: restaurants.length
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách nhà hàng', error);
    }
  }

  static async getRestaurantById(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.getRestaurantById(id);

      if (!restaurant) {
        return errorResponse(res, 'Không tìm thấy nhà hàng', null, 404);
      }

      return successResponse(res, 'Lấy thông tin nhà hàng thành công', restaurant);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy thông tin nhà hàng', error);
    }
  }

  static async createRestaurant(req, res) {
    try {
      const restaurant = await Restaurant.create(req.body);
      return successResponse(res, 'Tạo nhà hàng thành công', restaurant, 201);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi tạo nhà hàng', error);
    }
  }

  static async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.update(id, req.body);

      if (!restaurant) {
        return errorResponse(res, 'Không tìm thấy nhà hàng', null, 404);
      }

      return successResponse(res, 'Cập nhật nhà hàng thành công', restaurant);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi cập nhật nhà hàng', error);
    }
  }
}

module.exports = RestaurantController;