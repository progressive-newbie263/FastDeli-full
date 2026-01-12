const Restaurant = require('../models/Restaurants');
const { successResponse, errorResponse } = require('../utils/response');
const { foodPool } = require('../config/db');

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
  // bổ sung (cóp lại bên admin-restaurantController)
  static async getFoodsByRestaurantId(req, res) {
    try {
      const restaurantId = Number(req.params.id);
      if (!restaurantId || Number.isNaN(restaurantId)) {
        return res.status(400).json({
          success: false,
          message: 'restaurantId không hợp lệ',
          data: null,
        });
      }

      const foodsQuery = `
        SELECT f.*
        FROM foods f
        WHERE f.restaurant_id = $1
        ORDER BY f.created_at DESC NULLS LAST, f.food_id DESC NULLS LAST
      `;
      const foodsResult = await foodPool.query(foodsQuery, [restaurantId]);
      const foods = foodsResult.rows || [];

      //Trả foods trong data (schema chuẩn)
      return res.status(200).json({
        success: true,
        message: 'OK',
        data: foods,
      });
    } catch (err) {
      console.error('[food-service] Error in getFoodsByRestaurantId:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy món ăn của nhà hàng',
        data: null,
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