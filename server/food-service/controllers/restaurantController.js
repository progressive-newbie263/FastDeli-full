const Restaurant = require('../models/Restaurants');
const { successResponse, errorResponse } = require('../utils/response');

class RestaurantController {
  // controller cho phép lấy danh sách tất cả nhà hàng 
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

  //controller rút id nhà hàng và lấy ra thông tin của nhà hàng đó
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

  // Controller lấy nhà hàng theo ID và danh sách món ăn
  // note: đây là 1 api khó vcđ
  static async getFoodsByRestaurant(req, res) {
    try {
      const { id } = req.params;

      const filters = {
        primary_category_id: req.query.primary_category_id ? parseInt(req.query.primary_category_id) : null,
        secondary_category_id: req.query.secondary_category_id ? parseInt(req.query.secondary_category_id) : null,
        search: req.query.search,
        min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
        max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
        limit: req.query.limit ? parseInt(req.query.limit) : null
      };

      // Xoá các key không hợp lệ/null
      Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const { foods, total_foods } = await Restaurant.getFoodsByRestaurantId(id, filters);

      res.json({
        success: true,
        data: foods,
        total_foods
      });

    } catch (error) {
      console.error('Error in getFoodsByRestaurant:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách món ăn'
      });
    }
  }


  //controller tạo nhà hàng mới (POST /restaurants)
  static async createRestaurant(req, res) {
    try {
      const restaurant = await Restaurant.create(req.body);
      return successResponse(res, 'Tạo nhà hàng thành công', restaurant, 201);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi tạo nhà hàng', error);
    }
  }


  //controller cập nhật thông tin nhà hàng (PUT /restaurants/:id)
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