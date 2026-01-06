// server/food-service/routes/admin-stats.js
const express = require('express');
const router = express.Router();
const { foodPool, sharedPool } = require('../config/db');

/**
 * GET /api/admin/stats
 * Dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Total orders
    const ordersResult = await foodPool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM orders'
    );
    
    // Total revenue (chỉ đơn đã giao)
    const revenueResult = await foodPool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM orders 
       WHERE order_status = 'delivered'`
    );
    
    // Active restaurants
    const restaurantsResult = await foodPool.query(
      `
        SELECT COUNT(*) as count 
        FROM restaurants 
        WHERE status = 'active'
      `
    );
    
    // Total users
    const usersResult = await sharedPool.query(
      'SELECT COUNT(*) as count FROM users'
    );

    // Pending orders
    const pendingResult = await foodPool.query(
      `SELECT COUNT(*) as count 
       FROM orders 
       WHERE order_status = 'pending'`
    );

    // Today's revenue
    const todayRevenueResult = await foodPool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM orders
       WHERE DATE(created_at) = CURRENT_DATE
       AND order_status = 'delivered'`
    );

    // Calculate trends (so với tháng trước)
    const lastMonthOrdersResult = await foodPool.query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
       AND created_at < DATE_TRUNC('month', CURRENT_DATE)`
    );

    const currentMonthOrdersResult = await foodPool.query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`
    );

    const lastMonthOrders = parseInt(lastMonthOrdersResult.rows[0].count);
    const currentMonthOrders = parseInt(currentMonthOrdersResult.rows[0].count);
    const ordersTrend = lastMonthOrders > 0 
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : 0;

    // Response
    res.json({
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      activeRestaurants: parseInt(restaurantsResult.rows[0].count),
      totalUsers: parseInt(usersResult.rows[0].count),
      pendingOrders: parseInt(pendingResult.rows[0].count),
      todayRevenue: parseFloat(todayRevenueResult.rows[0].total),
      ordersTrend: parseFloat(ordersTrend),
      revenueTrend: 0, // TODO: Calculate
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * GET /api/admin/recent-orders?limit=10
 * Recent orders with user and restaurant info
 */
router.get('/recent-orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    /*
      * note: có thể cân nhắc thêm vào query này "user_phone"
      * Tạm thời xóa bỏ trong query: LEFT JOIN users u ON o.user_id = u.user_id
    */
    const result = await foodPool.query(`
      SELECT 
        o.id as order_id,
        o.order_code,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.created_at,
        o.user_name as customer_name,
        r.name as restaurant_name
      FROM orders o     
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      ORDER BY o.created_at DESC
      LIMIT $1
    `, [limit]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * GET /api/admin/chart-data
 * Last 7 days data for charts
 */
router.get('/chart-data', async (req, res) => {
  try {
    const result = await foodPool.query(`
      SELECT 
        TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
        COUNT(*)::int as orders,
        COALESCE(SUM(total_amount), 0)::float as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;