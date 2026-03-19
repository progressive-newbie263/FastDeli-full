const Restaurant = require('../models/Restaurants');
const { successResponse, errorResponse } = require('../utils/response');
const { foodPool, sharedPool } = require('../config/db');

class RestaurantController {
  // controller cho phép lấy danh sách tất cả nhà hàng 
  static async getAllRestaurants(req, res) {
    try {
      const { search, is_featured, limit, category_id } = req.query;
      
      const filters = {};
      if (search) filters.search = search;
      if (is_featured) filters.is_featured = is_featured === 'true';
      if (limit) filters.limit = parseInt(limit);
      if (category_id) {
        const parsedCategoryId = Number(category_id);
        if (Number.isFinite(parsedCategoryId) && parsedCategoryId > 0) {
          filters.category_id = parsedCategoryId;
        }
      }

      const restaurants = await Restaurant.getAll(filters);
      
      return successResponse(res, 'Lấy danh sách nhà hàng thành công', {
        restaurants,
        total: restaurants.length
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách nhà hàng', error);
    }
  }

  static async getNearbyRestaurants(req, res) {
    try {
      const { latitude, longitude, limit } = req.query;

      if (latitude === undefined || longitude === undefined) {
        return errorResponse(res, 'Thiếu latitude hoặc longitude', null, 400);
      }

      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return errorResponse(res, 'latitude hoặc longitude không hợp lệ', null, 400);
      }

      const safeLimit = Number(limit) || 12;
      let restaurants = await Restaurant.getNearbyRestaurants(lat, lng, safeLimit);
      let fallbackUsed = false;

      if (!restaurants.length) {
        restaurants = await Restaurant.getAll({ limit: safeLimit });
        fallbackUsed = true;
      }

      return successResponse(res, 'Lấy danh sách nhà hàng gần bạn thành công', {
        latitude: lat,
        longitude: lng,
        restaurants,
        total: restaurants.length,
        fallbackUsed,
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách nhà hàng gần bạn', error);
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

  static async getRestaurantReviews(req, res) {
    try {
      const restaurantId = Number(req.params.id);
      if (!restaurantId || Number.isNaN(restaurantId)) {
        return errorResponse(res, 'restaurantId không hợp lệ', null, 400);
      }

      const limit = Number(req.query.limit) || 20;
      const reviewsResult = await foodPool.query(
        `SELECT review_id, restaurant_id, user_id, order_id, rating, comment, created_at
         FROM reviews
         WHERE restaurant_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [restaurantId, limit]
      );

      const rows = reviewsResult.rows || [];
      const userIds = [...new Set(rows.map((review) => review.user_id).filter(Boolean))];
      let usersMap = new Map();

      if (userIds.length > 0) {
        const usersResult = await sharedPool.query(
          'SELECT user_id, full_name, avatar_url FROM users WHERE user_id = ANY($1)',
          [userIds]
        );
        usersMap = new Map(usersResult.rows.map((user) => [user.user_id, user]));
      }

      const reviews = rows.map((review) => {
        const user = usersMap.get(review.user_id) || {};
        return {
          ...review,
          customer_name: user.full_name || 'Khách hàng',
          customer_avatar: user.avatar_url || null,
        };
      });

      return successResponse(res, 'Lấy danh sách đánh giá thành công', {
        reviews,
        total: reviews.length,
      });
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy đánh giá nhà hàng', error);
    }
  }

  static async createRestaurantReview(req, res) {
    try {
      const restaurantId = Number(req.params.id);
      const { user_id, rating, comment, order_id } = req.body || {};

      if (!restaurantId || Number.isNaN(restaurantId)) {
        return errorResponse(res, 'restaurantId không hợp lệ', null, 400);
      }

      const userId = Number(user_id);
      if (!userId || Number.isNaN(userId)) {
        return errorResponse(res, 'Thiếu user_id hợp lệ', null, 400);
      }

      const parsedRating = Number(rating);
      if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return errorResponse(res, 'rating phải từ 1 đến 5', null, 400);
      }

      const inserted = await foodPool.query(
        `INSERT INTO reviews (restaurant_id, user_id, order_id, rating, comment, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING review_id, restaurant_id, user_id, order_id, rating, comment, created_at`,
        [restaurantId, userId, order_id || null, parsedRating, (comment || '').trim() || null]
      );

      return successResponse(res, 'Gửi đánh giá thành công', inserted.rows[0], 201);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi gửi đánh giá', error);
    }
  }

  
}

module.exports = RestaurantController;