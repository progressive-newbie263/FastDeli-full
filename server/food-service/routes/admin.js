const express = require('express');
const router = express.Router();
const { foodPool, sharedPool } = require('../config/db');

/**
  * GET /api/admin/users?page=1&limit=20&search=&role=
  * Liệt kê danh sách tất cả users. Đi kèm phân trang, tìm kiếm và lọc theo vai trò.
*/
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || ''; // 'customer', 'restaurant_owner', 'admin'
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone_number ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }
    /* 
      * Nếu có nhiều điều kiện where, ta sẽ nối chúng với AND
      * Nếu không có điều kiện nào, trả về rỗng.
      * Lấy tổng số lượng users qua đoạn này
    */
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await sharedPool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Lấy danh sách users kèm theo thống kê đơn hàng từ database food
    queryParams.push(limit, offset);
    const usersQuery = `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone_number,
        u.role,
        u.is_active,
        u.created_at
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const usersResult = await sharedPool.query(usersQuery, queryParams);
    const users = usersResult.rows;

    // Get order stats for each user from food database
    const userIds = users.map(u => u.user_id);
    
    let orderStats = {};
    if (userIds.length > 0) {
      const statsQuery = `
        SELECT 
          user_id,
          COUNT(*)::int as total_orders,
          COALESCE(SUM(total_amount), 0)::float as total_spent
        FROM orders
        WHERE user_id = ANY($1)
        GROUP BY user_id
      `;
      const statsResult = await foodPool.query(statsQuery, [userIds]);
      
      statsResult.rows.forEach(stat => {
        orderStats[stat.user_id] = {
          total_orders: stat.total_orders,
          total_spent: stat.total_spent
        };
      });
    }

    // Enrich users with order stats
    const enrichedUsers = users.map(user => ({
      ...user,
      total_orders: orderStats[user.user_id]?.total_orders || 0,
      total_spent: orderStats[user.user_id]?.total_spent || 0
    }));

    res.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


/**
 * GET /api/admin/users/:id
 * Get user detail
 */
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Get user info from shared DB
    const userResult = await sharedPool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get order history from food DB
    const ordersResult = await foodPool.query(`
      SELECT 
        o.id as order_id,
        o.order_code,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.created_at,
        r.name as restaurant_name
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [userId]);

    // Get stats
    const statsResult = await foodPool.query(`
      SELECT 
        COUNT(*)::int as total_orders,
        COALESCE(SUM(total_amount), 0)::float as total_spent,
        COALESCE(AVG(total_amount), 0)::float as avg_order_value
      FROM orders
      WHERE user_id = $1
    `, [userId]);

    res.json({
      user,
      orders: ordersResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user detail:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


/**
 * PUT /api/admin/users/:id
 * Update user info (full_name, phone_number, role, is_active)
 */
router.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { full_name, phone_number, role, is_active } = req.body;

    // Validate
    if (!full_name || !phone_number || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await sharedPool.query(`
      UPDATE users
      SET full_name = $1, phone_number = $2, role = $3, is_active = $4, updated_at = NOW()
      WHERE user_id = $5
      RETURNING *
    `, [full_name, phone, role, is_active, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


/**
 * DELETE /api/admin/users/:id
 * Soft delete user (set is_active = false)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const result = await sharedPool.query(`
      UPDATE users
      SET is_active = false, updated_at = NOW()
      WHERE user_id = $1
      RETURNING user_id
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;