const express = require('express');
const router = express.Router();
const { foodPool } = require('../config/db');

/**
 * GET /api/admin/restaurants?status=pending&page=1&limit=20
 * Lấy danh sách nhà hàng với filter và pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // set tối đa 10 mẫu tin mỗi trang
    const status = req.query.status || '';
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereConditions = ['r.is_active IS NOT NULL'];
    let queryParams = [];
    let paramIndex = 1;

    // Filter theo status
    if (status === 'pending') {
      whereConditions.push(`r.is_active = false`);
    } else if (status === 'active') {
      whereConditions.push(`r.is_active = true`);
    } else if (status === 'inactive') {
      whereConditions.push(`r.is_active = false`);
    }

    // Search
    if (search) {
      whereConditions.push(`(r.name ILIKE $${paramIndex} OR r.address ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    /* 
      * note: foodPool có vẻ là đủ hiện tại. 
      * sharedPool có thể sẽ được dùng trong tương lai
    */
    const countQuery = `
      SELECT COUNT(*) as total FROM restaurants r WHERE ${whereClause}
    `;
    const countResult = await foodPool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    queryParams.push(limit, offset);
    const restaurantsQuery = `
      SELECT 
        r.id,
        r.name,
        r.address,
        r.phone,
        r.email,
        r.description,
        r.image_url,
        r.rating,
        r.total_reviews,
        r.is_active,
        r.created_at,
        r.updated_at
      FROM restaurants r
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const restaurantsResult = await foodPool.query(restaurantsQuery, queryParams);

    res.json({
      restaurants: restaurantsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


/**
 * GET /api/admin/restaurants/:id
 * Chi tiết nhà hàng
 */
router.get('/:id', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);

    // ✅ FIX: Thay pool.query → foodPool.query
    const restaurantResult = await foodPool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const restaurant = restaurantResult.rows[0];

    // Get stats
    const statsResult = await foodPool.query(`
      SELECT 
        COUNT(DISTINCT f.food_id)::int as total_foods,
        COUNT(DISTINCT o.id)::int as total_orders,
        COALESCE(SUM(o.total_amount), 0)::float as total_revenue
      FROM restaurants r
      LEFT JOIN foods f ON r.id = f.restaurant_id
      LEFT JOIN orders o ON r.id = o.restaurant_id
      WHERE r.id = $1
    `, [restaurantId]);

    res.json({
      restaurant,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching restaurant detail:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


/**
 * PUT /api/admin/restaurants/:id/approve
 * Duyệt nhà hàng
 */
router.put('/:id/approve', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);

    const result = await foodPool.query(
      'UPDATE restaurants SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({
      message: 'Restaurant approved successfully',
      restaurant: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving restaurant:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


/**
 * PUT /api/admin/restaurants/:id/reject
 * Từ chối nhà hàng
 */
router.put('/:id/reject', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const { reason } = req.body;

    const result = await foodPool.query(
      `UPDATE restaurants 
       SET is_active = false, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({
      message: 'Restaurant rejected',
      restaurant: result.rows[0],
      reason
    });
  } catch (error) {
    console.error('Error rejecting restaurant:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


/**
 * PUT /api/admin/restaurants/:id/toggle-active
 * Bật/tắt trạng thái hoạt động
 */
router.put('/:id/toggle-active', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);

    const result = await foodPool.query(
      `UPDATE restaurants 
       SET is_active = NOT is_active, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({
      message: 'Restaurant status toggled',
      restaurant: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling restaurant status:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;