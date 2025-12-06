const express = require('express');
const router = express.Router();
const { foodPool, sharedPool } = require('../config/db');

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Tổng số đơn hàng/orders
    const ordersResult = await foodPool.query(
      'SELECT COUNT(*) as total FROM orders'
    );
    
    // Tổng doanh thu /revenue
    const revenueResult = await foodPool.query(
      'SELECT SUM(total_amount) as total FROM orders WHERE order_status = $1',
      ['delivered']
    );
    
    // Số lượng nhà hàng hoạt động/Active restaurants
    // const restaurantsResult = await foodPool.query(
    //   'SELECT COUNT(*) as total FROM restaurants WHERE order_status = $1',
    //   ['active']
    // );
    
    // số lượng người dùng/Total users
    const usersResult = await sharedPool.query(
      'SELECT COUNT(*) as total FROM users'
    );

    res.json({
      totalOrders: parseInt(ordersResult.rows[0].total),
      totalRevenue: parseFloat(revenueResult.rows[0].total || 0),
      //activeRestaurants: parseInt(restaurantsResult.rows[0].total),
      totalUsers: parseInt(usersResult.rows[0].total)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/recent-orders - 10 đơn hàng gần nhất
router.get('/recent-orders', async (req, res) => {
  try {
    const result = await foodPool.query(`
      SELECT 
        o.order_id,
        o.total_amount,
        o.order_status,
        o.created_at,
        u.name as customer_name,
        r.name as restaurant_name
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN restaurants r ON o.restaurant_id = r.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;