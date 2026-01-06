const Restaurant = require('../models/Restaurants');
const { successResponse, errorResponse } = require('../utils/response');
const { foodPool } = require('../config/db');

class AdminRestaurantController {
  /**
   * Lấy danh sách nhà hàng với phân trang
   * GET /api/admin/restaurants
   */
  static async getAllRestaurants(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        search: req.query.search
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });

      const result = await Restaurant.getAllWithPagination(page, limit, filters);

      return successResponse(res, 'Lấy danh sách nhà hàng thành công', result);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách nhà hàng', error);
    }
  }

  /**
   * Lấy thống kê nhà hàng
   * GET /api/admin/restaurants/statistics
   */
  static async getStatistics(req, res) {
    try {
      const stats = await Restaurant.getStatistics();
      return successResponse(res, 'Lấy thống kê thành công', stats);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy thống kê', error);
    }
  }

  /**
    * Lấy chi tiết nhà hàng
    * GET /api/admin/restaurants/:id
    * áp dụng function "get RestaurantByIdAdmin" từ model Restaurant. 
    * Lưu ý là tồn tại 2 api, 1 api cho admin và 1 api cho client.
  */
  static async getRestaurantById(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.getRestaurantByIdAdmin(id);

      if (!restaurant) {
        return errorResponse(res, 'Không tìm thấy nhà hàng', null, 404);
      }

      return successResponse(res, 'Lấy thông tin nhà hàng thành công', restaurant);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy thông tin nhà hàng', error);
    }
  }

  /**
   * Cập nhật trạng thái nhà hàng
   * PATCH /api/admin/restaurants/:id/status
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      // Validate status
      const validStatuses = ['active', 'inactive', 'pending', 'rejected'];
      if (!validStatuses.includes(status)) {
        return errorResponse(res, 'Trạng thái không hợp lệ', null, 400);
      }

      // Require reason for rejection
      if (status === 'rejected' && !reason) {
        return errorResponse(res, 'Vui lòng cung cấp lý do từ chối', null, 400);
      }

      const restaurant = await Restaurant.updateStatus(id, status, reason);

      if (!restaurant) {
        return errorResponse(res, 'Không tìm thấy nhà hàng', null, 404);
      }

      return successResponse(res, 'Cập nhật trạng thái thành công', restaurant);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi cập nhật trạng thái', error);
    }
  }

  /**
   * Phê duyệt nhà hàng
   * POST /api/admin/restaurants/:id/approve
   */
  static async approveRestaurant(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.approveRestaurant(id);

      if (!restaurant) {
        return errorResponse(res, 'Không tìm thấy nhà hàng', null, 404);
      }

      return successResponse(res, 'Phê duyệt nhà hàng thành công', restaurant);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi phê duyệt nhà hàng', error);
    }
  }

  /*
    * Từ chối nhà hàng
    * POST /api/admin/restaurants/:id/reject
  */
  static async rejectRestaurant(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim() === '') {
        return errorResponse(res, 'Vui lòng cung cấp lý do từ chối', null, 400);
      }

      const restaurant = await Restaurant.rejectRestaurant(id, reason);

      if (!restaurant) {
        return errorResponse(res, 'Không tìm thấy nhà hàng', null, 404);
      }

      return successResponse(res, 'Từ chối nhà hàng thành công', restaurant);
    } catch (error) {
      return errorResponse(res, error.message || 'Lỗi khi từ chối nhà hàng', error);
    }
  }

  /*
    * Lấy danh sách món ăn theo ID nhà hàng
    * GET /api/admin/restaurants/:id/foods
    * Note: api khó
  */
  static async getFoodsByRestaurantId(req, res) {
    try {
      const { id } = req.params;
      const filters = {
        primary_category_id: req.query.primary_category_id,
        secondary_category_id: req.query.secondary_category_id,
        search: req.query.search,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        limit: req.query.limit
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });

      let query = `
        SELECT 
          f.food_id,
          f.food_name,
          f.description,
          f.price,
          f.image_url,
          f.is_available,
          f.created_at,
          fc1.category_id AS primary_category_id,
          fc1.category_name AS primary_category_name,
          fc2.category_id AS secondary_category_id,
          fc2.category_name AS secondary_category_name
        FROM foods f
        LEFT JOIN food_categories fc1 ON f.primary_category_id = fc1.category_id
        LEFT JOIN food_categories fc2 ON f.secondary_category_id = fc2.category_id
        JOIN restaurants r ON f.restaurant_id = r.id
        WHERE f.restaurant_id = $1 AND f.is_available = true AND r.status = 'active'
      `;

      const params = [id];
      let paramIndex = 2;

      if (filters.primary_category_id) {
        query += ` AND f.primary_category_id = $${paramIndex}`;
        params.push(filters.primary_category_id);
        paramIndex++;
      }

      if (filters.secondary_category_id) {
        query += ` AND f.secondary_category_id = $${paramIndex}`;
        params.push(filters.secondary_category_id);
        paramIndex++;
      }

      if (filters.search) {
        query += ` AND f.food_name ILIKE $${paramIndex}`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.min_price) {
        query += ` AND f.price >= $${paramIndex}`;
        params.push(filters.min_price);
        paramIndex++;
      }

      if (filters.max_price) {
        query += ` AND f.price <= $${paramIndex}`;
        params.push(filters.max_price);
        paramIndex++;
      }

      query += ` ORDER BY f.created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
      }

      const result = await foodPool.query(query, params);

      const foods = result.rows.map(row => ({
        food_id: row.food_id,
        food_name: row.food_name,
        image_url: row.image_url || null,
        price: row.price,
        is_available: row.is_available,
        primary_category: {
          id: row.primary_category_id,
          name: row.primary_category_name
        },
        secondary_category: row.secondary_category_id
          ? {
              id: row.secondary_category_id,
              name: row.secondary_category_name
            }
          : null
      }));

      const data = {
        foods,
        total_foods: foods.length
      };

      return successResponse(res, 'Lấy danh sách món ăn thành công', data);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi lấy danh sách món ăn', error);
    }
  }
}

module.exports = AdminRestaurantController;