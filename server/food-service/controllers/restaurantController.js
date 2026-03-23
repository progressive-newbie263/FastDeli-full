const Restaurant = require('../models/Restaurants');
const { successResponse, errorResponse } = require('../utils/response');
const { foodPool, sharedPool } = require('../config/db');

let ensureReviewsTablePromise = null;

const ensureReviewsTable = async () => {
  if (ensureReviewsTablePromise) {
    return ensureReviewsTablePromise;
  }

  ensureReviewsTablePromise = (async () => {
    await foodPool.query(
      `CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    await foodPool.query('ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await foodPool.query('UPDATE reviews SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) WHERE updated_at IS NULL');

    await foodPool.query('DROP INDEX IF EXISTS uq_reviews_user_order_restaurant');
    await foodPool.query('DROP INDEX IF EXISTS idx_reviews_order');
    await foodPool.query('ALTER TABLE reviews DROP COLUMN IF EXISTS order_id');

    await foodPool.query(
      `DELETE FROM reviews r
       USING reviews newer
       WHERE r.restaurant_id = newer.restaurant_id
         AND r.user_id = newer.user_id
         AND (
           r.created_at < newer.created_at
           OR (r.created_at = newer.created_at AND r.review_id < newer.review_id)
         )`
    );

    await foodPool.query('CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id)');
    await foodPool.query('CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)');
    await foodPool.query('CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC)');
    await foodPool.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_user_restaurant ON reviews(user_id, restaurant_id)'
    );
  })().catch((error) => {
    ensureReviewsTablePromise = null;
    throw error;
  });

  return ensureReviewsTablePromise;
};

const updateRestaurantRatingAggregate = async (restaurantId, client = foodPool) => {
  await client.query(
    `UPDATE restaurants r
     SET
       rating = stats.avg_rating,
       total_reviews = stats.total_reviews,
       updated_at = CURRENT_TIMESTAMP
     FROM (
       SELECT
         $1::int AS restaurant_id,
         COALESCE(ROUND(AVG(rw.rating)::numeric, 2), 0)::numeric(3,2) AS avg_rating,
         COUNT(*)::int AS total_reviews
       FROM reviews rw
       WHERE rw.restaurant_id = $1
     ) stats
     WHERE r.id = stats.restaurant_id`,
    [restaurantId]
  );
};

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
      await ensureReviewsTable();
      const restaurantId = Number(req.params.id);
      if (!restaurantId || Number.isNaN(restaurantId)) {
        return errorResponse(res, 'restaurantId không hợp lệ', null, 400);
      }

      const limit = Number(req.query.limit) || 20;
      const reviewsResult = await foodPool.query(
        `SELECT review_id, restaurant_id, user_id, rating, comment, created_at
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
      await ensureReviewsTable();
      const restaurantId = Number(req.params.id);
      const { user_id, rating, comment } = req.body || {};

      if (!restaurantId || Number.isNaN(restaurantId)) {
        return errorResponse(res, 'restaurantId không hợp lệ', null, 400);
      }

      const userId = Number(user_id);
      if (!userId || Number.isNaN(userId)) {
        return errorResponse(res, 'Thiếu user_id hợp lệ', null, 400);
      }

      const parsedRating = Number(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return errorResponse(res, 'rating phải từ 1 đến 5', null, 400);
      }

      const duplicateReviewCheck = await foodPool.query(
        `SELECT review_id
         FROM reviews
         WHERE user_id = $1 AND restaurant_id = $2
         LIMIT 1`,
        [userId, restaurantId]
      );

      if (duplicateReviewCheck.rows.length > 0) {
        return errorResponse(res, 'Bạn đã đánh giá nhà hàng này rồi', null, 400);
      }

      const inserted = await foodPool.query(
        `INSERT INTO reviews (restaurant_id, user_id, rating, comment, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING review_id, restaurant_id, user_id, rating, comment, created_at`,
        [restaurantId, userId, parsedRating, (comment || '').trim() || null]
      );

      await updateRestaurantRatingAggregate(restaurantId);

      return successResponse(res, 'Gửi đánh giá thành công', inserted.rows[0], 201);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi gửi đánh giá', error);
    }
  }

  static async updateRestaurantReview(req, res) {
    try {
      await ensureReviewsTable();
      const restaurantId = Number(req.params.id);
      const { user_id, rating, comment } = req.body || {};

      if (!restaurantId || Number.isNaN(restaurantId)) {
        return errorResponse(res, 'restaurantId không hợp lệ', null, 400);
      }

      const userId = Number(user_id);
      if (!userId || Number.isNaN(userId)) {
        return errorResponse(res, 'Thiếu user_id hợp lệ', null, 400);
      }

      const parsedRating = Number(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return errorResponse(res, 'rating phải từ 1 đến 5', null, 400);
      }

      const existingReviewResult = await foodPool.query(
        `SELECT review_id, created_at, COALESCE(updated_at, created_at) AS last_action_at
         FROM reviews
         WHERE user_id = $1 AND restaurant_id = $2
         LIMIT 1`,
        [userId, restaurantId]
      );

      if (!existingReviewResult.rows.length) {
        return errorResponse(res, 'Bạn chưa có đánh giá để cập nhật', null, 404);
      }

      const existingReview = existingReviewResult.rows[0];
      const lastActionAt = new Date(existingReview.last_action_at || existingReview.created_at);
      const now = new Date();
      const diffMs = now.getTime() - lastActionAt.getTime();
      const cooldownMs = 24 * 60 * 60 * 1000;

      if (diffMs < cooldownMs) {
        const remainingMs = cooldownMs - diffMs;
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
        return errorResponse(
          res,
          `Bạn chỉ có thể cập nhật lại sau ${remainingHours} giờ nữa`,
          null,
          429
        );
      }

      const updated = await foodPool.query(
        `UPDATE reviews
         SET rating = $1,
             comment = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE review_id = $3
         RETURNING review_id, restaurant_id, user_id, rating, comment, created_at, updated_at`,
        [parsedRating, (comment || '').trim() || null, existingReview.review_id]
      );

      await updateRestaurantRatingAggregate(restaurantId);

      return successResponse(res, 'Cập nhật đánh giá thành công', updated.rows[0]);
    } catch (error) {
      return errorResponse(res, 'Lỗi khi cập nhật đánh giá', error);
    }
  }

  
}

module.exports = RestaurantController;