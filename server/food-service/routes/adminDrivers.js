const express = require('express');
const router = express.Router();
const { foodPool } = require('../config/db');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const normalizeStatus = (value) => {
  if (!value) return '';
  const status = String(value).trim().toLowerCase();
  if (['online', 'offline', 'busy'].includes(status)) {
    return status;
  }
  return '';
};

router.get('/drivers', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, MAX_LIMIT);
    const search = String(req.query.search || '').trim();
    const status = normalizeStatus(req.query.status);
    const offset = (page - 1) * limit;

    const whereClauses = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      whereClauses.push(`(d.full_name ILIKE $${paramIndex} OR d.phone ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex += 1;
    }

    if (status) {
      whereClauses.push(`d.status = $${paramIndex}`);
      values.push(status);
      paramIndex += 1;
    }

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countResult = await foodPool.query(
      `SELECT COUNT(*)::int AS total
       FROM drivers d
       ${whereClause}`,
      values
    );

    const total = countResult.rows[0]?.total || 0;

    const dataQuery = `
      SELECT
        d.id,
        d.user_id,
        d.full_name,
        d.phone,
        d.status,
        COALESCE(d.rating, 0)::float AS rating,
        COALESCE(d.total_deliveries, 0)::int AS total_deliveries,
        d.created_at,
        COALESCE(e.total_earnings, 0)::float AS total_earnings,
        COALESCE(a.total_orders, 0)::int AS total_orders,
        COALESCE(a.completed_orders, 0)::int AS completed_orders
      FROM drivers d
      LEFT JOIN (
        SELECT driver_id, COALESCE(SUM(amount), 0)::float AS total_earnings
        FROM driver_earnings
        GROUP BY driver_id
      ) e ON e.driver_id = d.id
      LEFT JOIN (
        SELECT
          driver_id,
          COUNT(*)::int AS total_orders,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_orders
        FROM delivery_assignments
        GROUP BY driver_id
      ) a ON a.driver_id = d.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const driversResult = await foodPool.query(dataQuery, [...values, limit, offset]);

    const summaryResult = await foodPool.query(
      `SELECT
         COUNT(*)::int AS total_drivers,
         COUNT(*) FILTER (WHERE status = 'online')::int AS online_drivers,
         COUNT(*) FILTER (WHERE status = 'busy')::int AS busy_drivers,
         COALESCE(AVG(rating), 0)::float AS avg_rating,
         COALESCE(SUM(total_deliveries), 0)::int AS total_deliveries
       FROM drivers`
    );

    const ordersResult = await foodPool.query(
      `SELECT
         COUNT(*)::int AS total_orders,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_orders
       FROM delivery_assignments`
    );

    const earningsResult = await foodPool.query(
      `SELECT COALESCE(SUM(amount), 0)::float AS total_earnings
       FROM driver_earnings`
    );

    const summary = {
      ...(summaryResult.rows[0] || {}),
      ...(ordersResult.rows[0] || {}),
      ...(earningsResult.rows[0] || {}),
    };

    return res.json({
      drivers: driversResult.rows,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching admin drivers:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;
