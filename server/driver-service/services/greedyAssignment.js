const { foodPool, sharedPool } = require('../../food-service/config/db');
const { distanceMeters } = require('../utils/distance');

function randUniformArea(radiusMeters) {
  // r = R * sqrt(U) để phân bố đều theo diện tích
  return radiusMeters * Math.sqrt(Math.random());
}

function generateCandidates({ centerLat, centerLng, radiusMeters, count }) {
  const earthRadius = 6378137;
  const latRad = (centerLat * Math.PI) / 180;

  const candidates = [];
  for (let i = 0; i < count; i++) {
    const r = randUniformArea(radiusMeters);
    const theta = Math.random() * 2 * Math.PI;

    // Approx conversion from meters to lat/lng deltas
    const dy = r * Math.sin(theta);
    const dx = r * Math.cos(theta);

    const deltaLat = dy / earthRadius;
    const deltaLon = dx / (earthRadius * Math.cos(latRad));

    const newLat = centerLat + (deltaLat * 180) / Math.PI;
    const newLng = centerLng + (deltaLon * 180) / Math.PI;

    candidates.push({ candidate_idx: i, latitude: newLat, longitude: newLng });
  }
  return candidates;
}

async function ensureOrderAssignment({
  orderId,
  requestingDriverUserId,
  restaurantLat,
  restaurantLng,
  radiusMeters,
  candidateCount,
}) {
  const client = await foodPool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT order_id, assigned_driver_user_id, selected_virtual_candidate_idx
       FROM order_driver_assignments
       WHERE order_id = $1
       LIMIT 1`,
      [orderId]
    );

    if (existing.rows.length > 0) {
      await client.query('COMMIT');
      return {
        assigned_driver_user_id: existing.rows[0].assigned_driver_user_id,
        selected_virtual_candidate_idx: existing.rows[0].selected_virtual_candidate_idx,
      };
    }

    if (!Number.isFinite(restaurantLat) || !Number.isFinite(restaurantLng)) {
      throw new Error('Invalid restaurant coordinates');
    }

    const candidates = generateCandidates({
      centerLat: restaurantLat,
      centerLng: restaurantLng,
      radiusMeters,
      count: candidateCount,
    });

    // Greedy: chọn candidate có cost nhỏ nhất (distance to restaurant)
    let best = null;
    for (const c of candidates) {
      const cost = distanceMeters(
        { lat: restaurantLat, lng: restaurantLng },
        { lat: c.latitude, lng: c.longitude }
      );
      if (!best || cost < best.cost) best = { ...c, cost };
    }

    const selectedIdx = best.candidate_idx;

    // Assign real driver: chọn driver gần selected candidate nhất
    const driversRes = await client.query(
      `SELECT driver_user_id, latitude, longitude
       FROM driver_locations
       WHERE is_online = true
         AND latitude IS NOT NULL AND longitude IS NOT NULL`
    );

    let assignedDriverId = requestingDriverUserId;
    if (driversRes.rows.length > 0) {
      let nearest = null;
      for (const d of driversRes.rows) {
        const dist = distanceMeters(
          { lat: Number(best.latitude), lng: Number(best.longitude) },
          { lat: Number(d.latitude), lng: Number(d.longitude) }
        );
        if (!nearest || dist < nearest.dist) nearest = { driver_user_id: d.driver_user_id, dist };
      }
      if (nearest?.driver_user_id) assignedDriverId = nearest.driver_user_id;
    }

    // Lưu virtual candidates
    for (const c of candidates) {
      await client.query(
        `INSERT INTO virtual_driver_candidates (order_id, candidate_idx, latitude, longitude)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (order_id, candidate_idx) DO NOTHING`,
        [orderId, c.candidate_idx, c.latitude, c.longitude]
      );
    }

    await client.query(
      `INSERT INTO order_driver_assignments (order_id, assigned_driver_user_id, selected_virtual_candidate_idx)
       VALUES ($1, $2, $3)`,
      [orderId, assignedDriverId, selectedIdx]
    );

    await client.query(
      `UPDATE orders
       SET order_status = 'delivering',
           updated_at = NOW()
       WHERE id = $1
         AND order_status NOT IN ('delivered', 'cancelled')`,
      [orderId]
    );

    await client.query('COMMIT');

    return { assigned_driver_user_id: assignedDriverId, selected_virtual_candidate_idx: selectedIdx };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getAssignmentAndCandidates(orderId) {
  const [assignmentRes, candidatesRes] = await Promise.all([
    foodPool.query(
      `SELECT order_id, assigned_driver_user_id, selected_virtual_candidate_idx
       FROM order_driver_assignments
       WHERE order_id = $1
       LIMIT 1`,
      [orderId]
    ),
    foodPool.query(
      `SELECT candidate_idx, latitude, longitude
       FROM virtual_driver_candidates
       WHERE order_id = $1
       ORDER BY candidate_idx ASC`,
      [orderId]
    ),
  ]);

  const assignment = assignmentRes.rows[0] || null;
  return {
    assignment,
    candidates: candidatesRes.rows.map((r) => ({
      candidate_idx: Number(r.candidate_idx),
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
    })),
  };
}

async function getDriverUser(driverUserId) {
  const res = await sharedPool.query(
    `SELECT user_id, full_name, phone_number, avatar_url
     FROM users
     WHERE user_id = $1
     LIMIT 1`,
    [driverUserId]
  );
  return res.rows[0] || null;
}

module.exports = {
  ensureOrderAssignment,
  getAssignmentAndCandidates,
  getDriverUser,
};

