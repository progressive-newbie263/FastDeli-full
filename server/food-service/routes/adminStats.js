// server/food-service/routes/admin-stats.js
const express = require('express');
const router = express.Router();
const { foodPool, sharedPool } = require('../config/db');

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function calcTrend(currentValue, previousValue) {
  const prev = toNumber(previousValue, 0);
  const curr = toNumber(currentValue, 0);
  if (prev <= 0) return 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

function distributePercent(total, buckets) {
  const t = Math.max(0, toNumber(total, 0));
  if (t === 0) return buckets.map(b => ({ ...b, value: 0 }));
  // Làm tròn theo phần trăm
  // Điều chỉnh chính xác để tổng bằng 100%
  const withPct = buckets.map(b => ({
    ...b,
    value: Math.round((toNumber(b.count, 0) / t) * 100)
  }));
  const sum = withPct.reduce((acc, b) => acc + b.value, 0);
  const delta = 100 - sum;
  
  if (withPct.length > 0) {
    withPct[withPct.length - 1].value += delta;
  }
  return withPct;
}

/*
  * GET /api/admin/stats (api sẽ cung cấp thông số bổ trợ cho trang dashboard của admin)
  * Note: phần này khá phức tạp, phải thử nghiệm kỹ lưỡng chút.
*/
router.get('/stats', async (req, res) => {
  try {
    // tổng toàn bộ đơn hàng
    const ordersResult = await foodPool.query('SELECT COUNT(*)::int as count FROM orders');

    /*
      - Query lấy tổng doanh thu 
      - Chỉ tính các đơn đã thanh toán (paid), không tính các đơn cancelled
      - Tính từ order_items (food_price * quantity)
    */
    const revenueResult = await foodPool.query(
      `SELECT COALESCE(SUM(t.items_total + t.delivery_fee), 0)::float AS total
       FROM (
         SELECT
           o.id,
           COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
           COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.payment_status = 'paid'
           AND o.order_status <> 'cancelled'
         GROUP BY o.id
       ) t`
    );
    
    // Cac nhà hàng đang hoạt động
    const restaurantsResult = await foodPool.query(`
      SELECT COUNT(*) as count 
      FROM restaurants 
      WHERE status = 'active'
    `);
    
    // Số người dùng tổng cộng
    const usersResult = await sharedPool.query(
      'SELECT COUNT(*) as count FROM users'
    );

    // Đơn hàng đang chờ để xử lý
    const pendingResult = await foodPool.query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE order_status = 'pending'
    `);

    // Doanh thu kiếm được trong ngày
    const todayRevenueResult = await foodPool.query(
      `SELECT COALESCE(SUM(t.items_total + t.delivery_fee), 0)::float AS total
       FROM (
         SELECT
           o.id,
           COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
           COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE DATE(o.created_at) = CURRENT_DATE
           AND o.payment_status = 'paid'
           AND o.order_status <> 'cancelled'
         GROUP BY o.id
       ) t`
    );

    // Ước lượng xu hướng (so với tháng trước)
    const lastMonthOrdersResult = await foodPool.query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND created_at < DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Đơn hàng trong tháng hiện tại
    const currentMonthOrdersResult = await foodPool.query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    const lastMonthOrders = parseInt(lastMonthOrdersResult.rows[0].count);
    const currentMonthOrders = parseInt(currentMonthOrdersResult.rows[0].count);
    const ordersTrend = lastMonthOrders > 0 
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : 0;

    // Doanh thu theo xu hướng (so với tháng trước)
    const [currentMonthRevenueRes, lastMonthRevenueRes] = await Promise.all([
      foodPool.query(
        `SELECT COALESCE(SUM(t.items_total + t.delivery_fee), 0)::float AS total
         FROM (
           SELECT
             o.id,
             COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
             COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           WHERE o.payment_status = 'paid'
             AND o.order_status <> 'cancelled'
             AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
             AND o.created_at <  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
           GROUP BY o.id
         ) t`
      ),
      foodPool.query(
        `SELECT COALESCE(SUM(t.items_total + t.delivery_fee), 0)::float AS total
         FROM (
           SELECT
             o.id,
             COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
             COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           WHERE o.payment_status = 'paid'
             AND o.order_status <> 'cancelled'
             AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
             AND o.created_at <  DATE_TRUNC('month', CURRENT_DATE)
           GROUP BY o.id
         ) t`
      ),
    ]);

    // Tính toán xu hướng doanh thu
    const revenueTrend = calcTrend(
      toNumber(currentMonthRevenueRes.rows[0]?.total, 0),
      toNumber(lastMonthRevenueRes.rows[0]?.total, 0)
    );

    // Response
    res.json({
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      activeRestaurants: parseInt(restaurantsResult.rows[0].count),
      totalUsers: parseInt(usersResult.rows[0].count),
      pendingOrders: parseInt(pendingResult.rows[0].count),
      todayRevenue: parseFloat(todayRevenueResult.rows[0].total),
      ordersTrend: parseFloat(ordersTrend),
      revenueTrend,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/*
  * GET /api/admin/recent-orders?limit=10
  * api này sẽ rút ra các đơn hàng mới nhất, dùng cho trang dashboard của admin
  * hiển thị kèm thông tin của người dùng và thông tin của nhà hàng
*/
router.get('/recent-orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    /*
      * note: có thể cân nhắc thêm vào query này "user_phone"
      * Tạm thời xóa bỏ trong query: LEFT JOIN users u ON o.user_id = u.user_id
    */
    const result = await foodPool.query(
      `SELECT
         o.id as order_id,
         o.order_code,
         (COALESCE(SUM(oi.quantity * oi.food_price), 0) + COALESCE(MAX(o.delivery_fee), 0))::float AS total_amount,
         o.order_status,
         o.payment_status,
         o.created_at,
         o.user_name as customer_name,
         r.name as restaurant_name
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       GROUP BY o.id, r.name
       ORDER BY o.created_at DESC
       LIMIT $1`,
      [limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/*
  * GET /api/admin/chart-data
  * Lấy dữ liệu x ngày bán hàng gần nhất cho biểu đồ trên trang dashboard của admin
  * hiện tại, x = 7 (chọn cứng luôn).
*/
router.get('/chart-data', async (req, res) => {
  try {
    const result = await foodPool.query(
      `WITH per_order AS (
         SELECT
           DATE(o.created_at) AS d,
           o.id AS order_id,
           COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
           COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY DATE(o.created_at), o.id
       )
       SELECT
         TO_CHAR(d, 'YYYY-MM-DD') as date,
         COUNT(*)::int as orders,
         COALESCE(SUM(items_total + delivery_fee), 0)::float as revenue
       FROM per_order
       GROUP BY d
       ORDER BY d ASC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/*
  * GET /api/admin/analytics?year=2024&period=month
  * Lấy dữ liệu phân tích nâng cao cho trang dashboard của admin
*/
router.get('/analytics', async (req, res) => {
  try {
    const year = toNumber(req.query.year, new Date().getFullYear());
    const period = (req.query.period || 'month').toString();
    const allowedPeriods = new Set(['today', 'week', 'month']);
    const effectivePeriod = allowedPeriods.has(period) ? period : 'month';

    let rangeQuery;

    // set khoảng thời gian cho bộ lọc.
    // Hiện tại, lưu động giữa 1 ngày, 1 tuần hoặc 1 tháng
    if (effectivePeriod === 'today') {
      rangeQuery = {
        start: "CURRENT_DATE",
        end: "CURRENT_DATE + INTERVAL '1 day'",
      };
    } else if (effectivePeriod === 'week') {
      rangeQuery = {
        start: "CURRENT_DATE - INTERVAL '7 days'",
        end: "CURRENT_DATE + INTERVAL '1 day'",
      };
    } else {
      rangeQuery = {
        start: "DATE_TRUNC('month', CURRENT_DATE)",
        end: "DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'",
      };
    }

    // khởi tạo các chỉ số chính
    // api sẽ giúp tính toán xu hướng so với tháng trước
    // bao gồm: doanh thu tháng, số đơn hàng tháng, giá trị đơn hàng trung bình
    const [
      monthRevenueRes, 
      lastMonthRevenueRes, 
      monthOrdersRes, 
      lastMonthOrdersRes, 
      monthAvgOrderRes, 
      lastMonthAvgOrderRes
    ] = await Promise.all([
      foodPool.query(
        `SELECT COALESCE(SUM(t.items_total + t.delivery_fee), 0)::float AS total
         FROM (
           SELECT
             o.id,
             COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
             COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           WHERE o.payment_status = 'paid'
             AND o.order_status <> 'cancelled'
             AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
             AND o.created_at <  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
           GROUP BY o.id
         ) t`
      ),
      foodPool.query(
        `SELECT COALESCE(SUM(t.items_total + t.delivery_fee), 0)::float AS total
         FROM (
           SELECT
             o.id,
             COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
             COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           WHERE o.payment_status = 'paid'
             AND o.order_status <> 'cancelled'
             AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
             AND o.created_at <  DATE_TRUNC('month', CURRENT_DATE)
           GROUP BY o.id
         ) t`
      ),
      foodPool.query(
        `SELECT COUNT(*)::int AS count
         FROM orders
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
           AND created_at <  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`
      ),
      foodPool.query(
        `SELECT COUNT(*)::int AS count
         FROM orders
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND created_at <  DATE_TRUNC('month', CURRENT_DATE)`
      ),
      foodPool.query(
        `SELECT COALESCE(AVG(t.items_total + t.delivery_fee), 0)::float AS avg
         FROM (
           SELECT
             o.id,
             COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
             COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           WHERE o.payment_status = 'paid'
             AND o.order_status <> 'cancelled'
             AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
             AND o.created_at <  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
           GROUP BY o.id
         ) t`
      ),
      foodPool.query(
        `SELECT COALESCE(AVG(t.items_total + t.delivery_fee), 0)::float AS avg
         FROM (
           SELECT
             o.id,
             COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
             COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           WHERE o.payment_status = 'paid'
             AND o.order_status <> 'cancelled'
             AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
             AND o.created_at <  DATE_TRUNC('month', CURRENT_DATE)
           GROUP BY o.id
         ) t`
      ),
    ]);

    /*
      các chỉ số sẽ của tháng trước/tháng này để tính toán xu hướng sẽ là:
        - revenue / doanh thu
        - orders / tổng số lượng đơn hàng
        - avg order value / giá trị đơn hàng trung bình (ví dụ: 100 đơn hàng, 20 triệu)
    */
    const monthRevenue = toNumber(monthRevenueRes.rows[0]?.total, 0);
    const lastMonthRevenue = toNumber(lastMonthRevenueRes.rows[0]?.total, 0);
    const monthOrders = toNumber(monthOrdersRes.rows[0]?.count, 0);
    const lastMonthOrders = toNumber(lastMonthOrdersRes.rows[0]?.count, 0);
    const avgOrderValue = toNumber(monthAvgOrderRes.rows[0]?.avg, 0);
    const lastAvgOrderValue = toNumber(lastMonthAvgOrderRes.rows[0]?.avg, 0);

    const dayOfMonth = Math.max(1, toNumber(new Date().getDate(), 1));

    // cơ sở để so sánh sẽ là số ngày của tháng trước
    const lastMonthDaysRes = await foodPool.query(
      `SELECT EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::int AS days`
    );

    const lastMonthDays = Math.max(1, toNumber(lastMonthDaysRes.rows[0]?.days, 30));
    const avgOrdersPerDay = monthOrders / dayOfMonth;
    const lastAvgOrdersPerDay = lastMonthOrders / lastMonthDays;

    const metrics = {
      monthRevenue,
      monthRevenueTrend: calcTrend(monthRevenue, lastMonthRevenue),
      monthOrders,
      monthOrdersTrend: calcTrend(monthOrders, lastMonthOrders),
      avgOrdersPerDay: Number(avgOrdersPerDay.toFixed(0)),
      avgOrdersPerDayTrend: calcTrend(avgOrdersPerDay, lastAvgOrdersPerDay),
      avgOrderValue,
      avgOrderValueTrend: calcTrend(avgOrderValue, lastAvgOrderValue),
    };

    // doanh thu theo tháng (lựa chọn năm trên thanh selector dropdown)
    const revenueByMonthRes = await foodPool.query(
      `WITH months AS (
         SELECT generate_series(1, 12)::int AS month
       ),
       orders_by_month AS (
         SELECT
           EXTRACT(MONTH FROM o.created_at)::int AS month,
           COUNT(*)::int AS orders
         FROM orders o
         WHERE EXTRACT(YEAR FROM o.created_at) = $1
         GROUP BY EXTRACT(MONTH FROM o.created_at)
       ),
       paid_revenue_by_month AS (
         SELECT
           EXTRACT(MONTH FROM o.created_at)::int AS month,
           COALESCE(SUM(t.items_total + t.delivery_fee), 0)::float AS revenue
         FROM (
           SELECT
             o.id,
             o.created_at,
             COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
             COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           WHERE o.payment_status = 'paid'
             AND o.order_status <> 'cancelled'
             AND EXTRACT(YEAR FROM o.created_at) = $1
           GROUP BY o.id
         ) t
         JOIN orders o ON o.id = t.id
         GROUP BY EXTRACT(MONTH FROM o.created_at)
       )
       SELECT
         m.month,
         COALESCE(dr.revenue, 0)::float AS revenue,
         COALESCE(obm.orders, 0)::int AS orders
       FROM months m
       LEFT JOIN paid_revenue_by_month dr ON dr.month = m.month
       LEFT JOIN orders_by_month obm ON obm.month = m.month
       ORDER BY m.month ASC`,
      [year]
    );

    const revenueByMonth = revenueByMonthRes.rows.map(r => ({
      month: `T${r.month}`,
      revenue: toNumber(r.revenue, 0),
      orders: toNumber(r.orders, 0),
    }));

    // Đơn hàng theo ngày trong tuần (Thứ 2 - Chủ nhật)
    const weekdayRes = await foodPool.query(
      `SELECT EXTRACT(DOW FROM created_at)::int AS dow, COUNT(*)::int AS count
       FROM orders
       WHERE created_at >= ${rangeQuery.start}
         AND created_at <  ${rangeQuery.end}
       GROUP BY dow`
    );
    const weekdayMap = new Map(weekdayRes.rows.map(r => [toNumber(r.dow, 0), toNumber(r.count, 0)]));
    const ordersByWeekday = [
      { key: 1, day: 'T2' },
      { key: 2, day: 'T3' },
      { key: 3, day: 'T4' },
      { key: 4, day: 'T5' },
      { key: 5, day: 'T6' },
      { key: 6, day: 'T7' },
      { key: 0, day: 'CN' },
    ].map(d => ({ 
      day: d.day, 
      orders: weekdayMap.get(d.key) || 0 
    }));

    // Phân phối trạng thái đơn hàng (số lượng -> phần trăm)
    const statusRes = await foodPool.query(
      `SELECT order_status, COUNT(*)::int AS count
       FROM orders
       WHERE created_at >= ${rangeQuery.start}
         AND created_at <  ${rangeQuery.end}
       GROUP BY order_status`
    );

    const statusCounts = {
      delivered: 0,
      processing: 0,
      cancelled: 0,
      pending: 0,
      other: 0,
    };
    
    for (const row of statusRes.rows) {
      const status = (row.order_status || '').toString();
      const c = toNumber(row.count, 0);
      if (status === 'delivered') statusCounts.delivered += c;
      else if (status === 'cancelled') statusCounts.cancelled += c;
      else if (status === 'pending') statusCounts.pending += c;
      else if (['preparing', 'ready', 'delivering', 'processing'].includes(status)) statusCounts.processing += c;
      else statusCounts.other += c;
    }
    const totalStatus = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const statusBuckets = [
      { name: 'Hoàn thành', count: statusCounts.delivered, color: '#10B981' },
      { name: 'Đang xử lý', count: statusCounts.processing, color: '#F59E0B' },
      { name: 'Đã hủy', count: statusCounts.cancelled, color: '#EF4444' },
      { name: 'Mới', count: statusCounts.pending, color: '#6366F1' },
    ];
    const orderStatus = distributePercent(totalStatus, statusBuckets).map(({ name, value, color }) => ({ name, value, color }));

    // Top các nhà hàng theo doanh thu 
    // gợi ý người dùng rằng nhà hàng này là ưu tiên hàng đầu của các khách hàng khác
    const topRestaurantsRes = await foodPool.query(
      `SELECT
         COALESCE(r.name, 'N/A') AS name,
         COUNT(*)::int AS orders,
         COALESCE(SUM(t.items_total + t.delivery_fee), 0)::float AS revenue
       FROM (
         SELECT
           o.id,
           o.restaurant_id,
           COALESCE(SUM(oi.quantity * oi.food_price), 0)::float AS items_total,
           COALESCE(MAX(o.delivery_fee), 0)::float AS delivery_fee
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.payment_status = 'paid'
           AND o.order_status <> 'cancelled'
           AND o.created_at >= ${rangeQuery.start}
           AND o.created_at <  ${rangeQuery.end}
         GROUP BY o.id
       ) t
       LEFT JOIN restaurants r ON t.restaurant_id = r.id
       GROUP BY r.name
       ORDER BY revenue DESC
       LIMIT 5`
    );
    const topRestaurants = topRestaurantsRes.rows.map(r => ({
      name: r.name,
      orders: toNumber(r.orders, 0),
      revenue: toNumber(r.revenue, 0),
    }));


    // Hoạt động gần nhất:
    const recentOrdersRes = await foodPool.query(`
      SELECT COUNT(*)::int AS count
      FROM orders
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `);
    const newRestaurantsRes = await foodPool.query(`
      SELECT COUNT(*)::int AS count
      FROM restaurants
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    `);
    
    const recentActivity = [
      {
        kind: 'orders',
        title: `${toNumber(recentOrdersRes.rows[0]?.count, 0)} đơn hàng mới trong 24 giờ qua`,
        time: 'Trong 24 giờ',
      },
      {
        kind: 'revenue',
        title: `Doanh thu tháng này: ${Math.round(monthRevenue).toLocaleString('vi-VN')} ₫`,
        time: 'Cập nhật theo thời gian thực',
      },
      {
        kind: 'restaurants',
        title: `${toNumber(newRestaurantsRes.rows[0]?.count, 0)} nhà hàng mới trong 7 ngày qua`,
        time: '7 ngày gần đây',
      },
    ];

    res.json({
      metrics,
      revenueByMonth,
      ordersByWeekday,
      orderStatus,
      topRestaurants,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;