const bcrypt = require('bcryptjs');

const { foodPool, sharedPool } = require('../../food-service/config/db');
const { geocodeAddress } = require('../utils/geo');
const {
  ensureOrderAssignment,
  getAssignmentAndCandidates,
  getDriverUser,
} = require('../services/greedyAssignment');

const DEFAULT_AVATAR_URL =
  process.env.DEFAULT_AVATAR_URL ||
  'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';

async function registerDriver(req, res) {
  try {
    const { phone_number, email, password, full_name, gender, date_of_birth } = req.body || {};

    if (!phone_number || !email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingRes = await sharedPool.query(
      `SELECT user_id, role FROM users WHERE phone_number = $1 OR email = $2 LIMIT 1`,
      [phone_number, email]
    );
    if (existingRes.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone/email already used' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Cho phep bo qua buoc duyet de test mobile nhanh hon.
    // Dat DRIVER_AUTO_APPROVE=0 de quay lai flow cho admin duyet.
    const shouldAutoApprove = process.env.DRIVER_AUTO_APPROVE !== '0';

    const insertRes = await sharedPool.query(
      `INSERT INTO users
        (phone_number, email, password_hash, full_name, gender, date_of_birth, avatar_url, role, is_active)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, 'driver', $8)
       RETURNING user_id, full_name, email, role, is_active, created_at`,
      [
        phone_number,
        email,
        password_hash,
        full_name,
        gender || null,
        date_of_birth || null,
        DEFAULT_AVATAR_URL,
        shouldAutoApprove,
      ]
    );

    return res.status(201).json({
      success: true,
      message: shouldAutoApprove
        ? 'Register driver success. Account is active.'
        : 'Register driver submitted. Waiting admin approval.',
      data: insertRes.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Register driver error', error: err?.message });
  }
}

async function updateLocation(req, res) {
  try {
    const driverUserId = req.userId;
    const { latitude, longitude } = req.body || {};

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, message: 'Invalid latitude/longitude' });
    }

    await foodPool.query(
      `INSERT INTO driver_locations (driver_user_id, latitude, longitude, is_online, updated_at)
       VALUES ($1, $2, $3, true, NOW())
       ON CONFLICT (driver_user_id) DO UPDATE
       SET latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           is_online = true,
           updated_at = NOW()`,
      [driverUserId, lat, lng]
    );

    return res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Update location error', error: err?.message });
  }
}

async function getDeliveringOrders(req, res) {
  try {
    const driverUserId = req.userId;
    const limit = Number(req.query.limit || 20);

    const result = await foodPool.query(
      `
      SELECT
        o.id AS order_id,
        o.order_code,
        o.order_status,
        o.user_id,
        o.user_name,
        o.delivery_address,
        r.id AS restaurant_id,
        r.name AS restaurant_name,
        r.address AS restaurant_address,
        rl.latitude AS restaurant_latitude,
        rl.longitude AS restaurant_longitude,
        a.selected_virtual_candidate_idx,
        v.latitude AS selected_candidate_latitude,
        v.longitude AS selected_candidate_longitude
      FROM orders o
      JOIN order_driver_assignments a ON a.order_id = o.id
      JOIN restaurants r ON r.id = o.restaurant_id
      LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
      LEFT JOIN virtual_driver_candidates v
        ON v.order_id = o.id AND v.candidate_idx = a.selected_virtual_candidate_idx
      WHERE a.assigned_driver_user_id = $1
        AND o.order_status = 'delivering'
      ORDER BY o.created_at DESC
      LIMIT $2
      `,
      [driverUserId, limit]
    );

    // Nếu restaurant chưa có lat/lng thì fallback geocode theo address.
    const orders = await Promise.all(
      result.rows.map(async (row) => {
        let restaurantLat = Number(row.restaurant_latitude);
        let restaurantLng = Number(row.restaurant_longitude);

        if (!Number.isFinite(restaurantLat) || !Number.isFinite(restaurantLng)) {
          const geo = await geocodeAddress(row.restaurant_address);
          restaurantLat = geo?.lat ?? 0;
          restaurantLng = geo?.lng ?? 0;
        }

        return {
          order_id: row.order_id,
          order_code: row.order_code,
          order_status: row.order_status,
          restaurant: {
            restaurant_id: row.restaurant_id,
            name: row.restaurant_name,
            latitude: restaurantLat,
            longitude: restaurantLng,
          },
          customer: {
            user_id: row.user_id,
            full_name: row.user_name,
            delivery_address: row.delivery_address,
          },
          selected_virtual_candidate:
            row.selected_virtual_candidate_idx !== null && row.selected_virtual_candidate_idx !== undefined
              ? {
                  candidate_idx: Number(row.selected_virtual_candidate_idx),
                  latitude: Number(row.selected_candidate_latitude),
                  longitude: Number(row.selected_candidate_longitude),
                }
              : undefined,
        };
      })
    );

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Get delivering orders error', error: err?.message });
  }
}

async function getOrderMap(req, res) {
  try {
    const driverUserId = req.userId;
    const orderId = Number(req.params.orderId);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid orderId' });
    }

    const radiusMeters = Number(req.query.radiusMeters || process.env.VIRTUAL_DRIVER_RADIUS_METERS || 1000);
    const candidateCount = Number(req.query.candidateCount || process.env.VIRTUAL_DRIVER_CANDIDATE_COUNT || 12);

    const orderRes = await foodPool.query(
      `
      SELECT
        o.id AS order_id,
        o.order_code,
        o.order_status,
        o.user_id,
        o.user_name,
        o.delivery_address,
        o.delivery_latitude,
        o.delivery_longitude,
        r.id AS restaurant_id,
        r.name AS restaurant_name,
        r.address AS restaurant_address,
        rl.latitude AS restaurant_latitude,
        rl.longitude AS restaurant_longitude
      FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
      WHERE o.id = $1
      LIMIT 1
      `,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const row = orderRes.rows[0];

    let restaurantLat = Number(row.restaurant_latitude);
    let restaurantLng = Number(row.restaurant_longitude);
    if (!Number.isFinite(restaurantLat) || !Number.isFinite(restaurantLng)) {
      const geo = await geocodeAddress(row.restaurant_address);
      restaurantLat = geo?.lat ?? null;
      restaurantLng = geo?.lng ?? null;
    }

    if (!Number.isFinite(restaurantLat) || !Number.isFinite(restaurantLng)) {
      return res.status(400).json({ success: false, message: 'Cannot resolve restaurant coordinates' });
    }

    let customerLat = Number(row.delivery_latitude);
    let customerLng = Number(row.delivery_longitude);
    if (!Number.isFinite(customerLat) || !Number.isFinite(customerLng)) {
      const geo = await geocodeAddress(row.delivery_address);
      customerLat = geo?.lat ?? null;
      customerLng = geo?.lng ?? null;
    }

    // Ensure greedy assignment exists (and order is set to 'delivering')
    await ensureOrderAssignment({
      orderId,
      requestingDriverUserId: driverUserId,
      restaurantLat: Number(restaurantLat),
      restaurantLng: Number(restaurantLng),
      radiusMeters,
      candidateCount,
    });

    const { assignment, candidates } = await getAssignmentAndCandidates(orderId);
    const selectedIdx = assignment?.selected_virtual_candidate_idx;

    const currentOrderStatusRes = await foodPool.query(
      `SELECT order_status FROM orders WHERE id = $1 LIMIT 1`,
      [orderId]
    );
    const currentOrderStatus = currentOrderStatusRes.rows[0]?.order_status || row.order_status;

    const assignedDriverUserId = assignment?.assigned_driver_user_id ?? null;
    const assignedDriver = assignedDriverUserId ? await getDriverUser(assignedDriverUserId) : null;

    return res.json({
      success: true,
      data: {
        order_id: row.order_id,
        order_code: row.order_code,
        order_status: currentOrderStatus,
        restaurant: {
          restaurant_id: row.restaurant_id,
          name: row.restaurant_name,
          latitude: Number(restaurantLat),
          longitude: Number(restaurantLng),
        },
        customer: {
          user_id: row.user_id,
          full_name: row.user_name,
          latitude: Number.isFinite(customerLat) ? customerLat : null,
          longitude: Number.isFinite(customerLng) ? customerLng : null,
          delivery_address: row.delivery_address,
        },
        virtual_candidates: candidates,
        selected_virtual_candidate_idx: Number(selectedIdx),
        assigned_driver: assignedDriver,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Get order map error', error: err?.message });
  }
}

async function confirmDelivered(req, res) {
  try {
    const driverUserId = req.userId;
    const orderId = Number(req.params.orderId);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid orderId' });
    }

    const [orderRes, assignmentRes] = await Promise.all([
      foodPool.query(`SELECT id, order_status FROM orders WHERE id = $1 LIMIT 1`, [orderId]),
      foodPool.query(
        `SELECT order_id, assigned_driver_user_id
         FROM order_driver_assignments
         WHERE order_id = $1
         LIMIT 1`,
        [orderId]
      ),
    ]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = orderRes.rows[0];
    if (order.order_status !== 'delivering') {
      return res.status(400).json({ success: false, message: `Order not in delivering state: ${order.order_status}` });
    }

    if (assignmentRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Order assignment not found' });
    }
    const assignment = assignmentRes.rows[0];
    if (Number(assignment.assigned_driver_user_id) !== Number(driverUserId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: order assigned to another driver' });
    }

    const updated = await foodPool.query(
      `UPDATE orders
       SET order_status = 'delivered',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [orderId]
    );

    return res.json({ success: true, message: 'Order delivered', data: updated.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Confirm delivered error', error: err?.message });
  }
}

module.exports = {
  registerDriver,
  updateLocation,
  getDeliveringOrders,
  getOrderMap,
  confirmDelivered,
};

