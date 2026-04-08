const { foodPool, sharedPool } = require('../config/db');

const MAX_RADIUS_KM = 30;

const parseCoordinate = (raw) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
        return null;
    }
    return parsed;
};

const sanitizeRadius = (raw) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return MAX_RADIUS_KM;
    }
    return Math.min(parsed, MAX_RADIUS_KM);
};

const ensureDriverProfile = async (client, userId) => {
    const existing = await client.query(
        `SELECT id, user_id, full_name, phone, status, rating, total_deliveries
         FROM drivers
         WHERE user_id = $1
         LIMIT 1`,
        [userId]
    );

    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const sharedUserResult = await sharedPool.query(
        `SELECT user_id, full_name, phone_number
         FROM users
         WHERE user_id = $1
         LIMIT 1`,
        [userId]
    );

    if (sharedUserResult.rows.length === 0) {
        const notFoundError = new Error('DRIVER_USER_NOT_FOUND');
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const sharedUser = sharedUserResult.rows[0];
    const fullName = String(sharedUser.full_name || `Driver ${userId}`).trim();
    const phone = String(sharedUser.phone_number || '0000000000').trim();

    const inserted = await client.query(
        `INSERT INTO drivers (user_id, full_name, phone, status)
         VALUES ($1, $2, $3, 'offline')
         ON CONFLICT (user_id)
         DO UPDATE SET
             full_name = EXCLUDED.full_name,
             phone = COALESCE(NULLIF(drivers.phone, ''), EXCLUDED.phone)
         RETURNING id, user_id, full_name, phone, status, rating, total_deliveries`,
        [userId, fullName, phone]
    );

    return inserted.rows[0];
};

const getDriverProfile = async (userId) => {
    const client = await foodPool.connect();
    try {
        await client.query('BEGIN');
        const driver = await ensureDriverProfile(client, userId);
        await client.query('COMMIT');
        return driver;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.getMe = async (req, res) => {
    try {
        const driver = await getDriverProfile(req.user.userId);
        return res.json({ success: true, data: driver });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        console.error('[driver][getMe] error:', error);
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 404 ? 'Không tìm thấy tài khoản tài xế.' : 'Lỗi hệ thống khi lấy hồ sơ tài xế.',
        });
    }
};

exports.createProfile = async (req, res) => {
    try {
        const driver = await getDriverProfile(req.user.userId);
        return res.status(201).json({
            success: true,
            message: 'Đã đồng bộ hồ sơ tài xế.',
            data: driver,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        console.error('[driver][createProfile] error:', error);
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 404 ? 'Không tìm thấy người dùng để tạo hồ sơ tài xế.' : 'Lỗi hệ thống khi tạo hồ sơ tài xế.',
        });
    }
};

exports.updateStatus = async (req, res) => {
    const status = String(req.body?.status || '').trim().toLowerCase();
    if (!['online', 'offline'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Trạng thái hợp lệ: online hoặc offline.',
        });
    }

    const client = await foodPool.connect();
    try {
        await client.query('BEGIN');
        const driver = await ensureDriverProfile(client, req.user.userId);
        const updated = await client.query(
            `UPDATE drivers
             SET status = $1,
                     updated_at = NOW()
             WHERE id = $2
             RETURNING id, user_id, full_name, phone, status, rating, total_deliveries`,
            [status, driver.id]
        );
        await client.query('COMMIT');

        return res.json({
            success: true,
            message: status === 'online' ? 'Bạn đã trực tuyến.' : 'Bạn đã chuyển sang ngoại tuyến.',
            data: updated.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[driver][updateStatus] error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi cập nhật trạng thái tài xế.',
        });
    } finally {
        client.release();
    }
};

exports.updateLocation = async (req, res) => {
    const latitude = parseCoordinate(req.body?.lat ?? req.body?.latitude);
    const longitude = parseCoordinate(req.body?.lng ?? req.body?.longitude);
    const accuracy = parseCoordinate(req.body?.accuracy);

    if (latitude === null || longitude === null) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu hoặc sai định dạng toạ độ lat/lng.',
        });
    }

    const client = await foodPool.connect();
    try {
        await client.query('BEGIN');
        const driver = await ensureDriverProfile(client, req.user.userId);

        await client.query(
            `INSERT INTO driver_locations (driver_id, latitude, longitude, accuracy, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (driver_id)
             DO UPDATE SET
                 latitude = EXCLUDED.latitude,
                 longitude = EXCLUDED.longitude,
                 accuracy = EXCLUDED.accuracy,
                 updated_at = NOW()`,
            [driver.id, latitude, longitude, accuracy]
        );

        await client.query('COMMIT');
        return res.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[driver][updateLocation] error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi cập nhật vị trí tài xế.',
        });
    } finally {
        client.release();
    }
};

exports.getAvailableOrders = async (req, res) => {
    const latitude = parseCoordinate(req.query?.lat);
    const longitude = parseCoordinate(req.query?.lng);
    const radiusKm = sanitizeRadius(req.query?.radius_km);

    if (latitude === null || longitude === null) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu hoặc sai định dạng lat/lng.',
        });
    }

    try {
        await getDriverProfile(req.user.userId);

        const result = await foodPool.query(
            `WITH candidate_orders AS (
                 SELECT
                     o.id AS order_id,
                     o.order_code,
                     o.restaurant_id,
                     r.name AS restaurant_name,
                     r.address AS restaurant_address,
                     o.user_name,
                     o.user_phone,
                     o.delivery_address,
                     o.delivery_fee,
                     o.total_amount,
                     o.order_status,
                     rl.latitude AS restaurant_latitude,
                     rl.longitude AS restaurant_longitude,
                     (
                         6371 * acos(
                             LEAST(
                                 1,
                                 GREATEST(
                                     -1,
                                     cos(radians($1)) * cos(radians(rl.latitude)) * cos(radians(rl.longitude) - radians($2)) +
                                     sin(radians($1)) * sin(radians(rl.latitude))
                                 )
                             )
                         )
                     ) AS distance_km
                 FROM orders o
                 JOIN restaurants r ON r.id = o.restaurant_id
                 JOIN restaurant_locations rl ON rl.restaurant_id = o.restaurant_id
                 LEFT JOIN delivery_assignments da
                     ON da.order_id = o.id
                    AND da.status IN ('accepted', 'picking_up', 'delivering')
                 WHERE o.order_status = 'processing'
                     AND rl.latitude IS NOT NULL
                     AND rl.longitude IS NOT NULL
                     AND da.id IS NULL
             )
             SELECT *
             FROM candidate_orders
             WHERE distance_km <= $3
             ORDER BY distance_km ASC, order_id ASC
             LIMIT 50`,
            [latitude, longitude, radiusKm]
        );

        return res.json({
            success: true,
            radius_km: radiusKm,
            count: result.rowCount,
            data: result.rows,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        console.error('[driver][getAvailableOrders] error:', error);
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 404 ? 'Không tìm thấy tài khoản tài xế.' : 'Lỗi hệ thống khi lấy danh sách đơn khả dụng.',
        });
    }
};

exports.acceptOrder = async (req, res) => {
    const orderId = Number(req.body?.order_id || req.params?.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'order_id không hợp lệ.',
        });
    }

    const client = await foodPool.connect();
    try {
        await client.query('BEGIN');

        const driver = await ensureDriverProfile(client, req.user.userId);

        const orderResult = await client.query(
            `SELECT id, order_status
             FROM orders
             WHERE id = $1
             FOR UPDATE`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng.',
            });
        }

        if (orderResult.rows[0].order_status !== 'processing') {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: 'Đơn hàng không còn ở trạng thái processing.',
            });
        }

        const insertAssignment = await client.query(
            `INSERT INTO delivery_assignments (order_id, driver_id, status, assigned_at)
             VALUES ($1, $2, 'accepted', NOW())
             ON CONFLICT (order_id) DO NOTHING
             RETURNING id, order_id, driver_id, status, assigned_at`,
            [orderId, driver.id]
        );

        if (insertAssignment.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: 'Đơn hàng đã được tài xế khác nhận trước.',
            });
        }

        await client.query(
            `UPDATE drivers
             SET status = 'busy',
                     updated_at = NOW()
             WHERE id = $1`,
            [driver.id]
        );

        await client.query('COMMIT');
        return res.json({
            success: true,
            message: 'Nhận đơn thành công.',
            data: insertAssignment.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[driver][acceptOrder] error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi nhận đơn.',
        });
    } finally {
        client.release();
    }
};

exports.rejectOrder = async (req, res) => {
    const orderId = Number(req.body?.order_id || req.params?.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'order_id không hợp lệ.',
        });
    }

    const client = await foodPool.connect();
    try {
        await client.query('BEGIN');

        await ensureDriverProfile(client, req.user.userId);
        const orderResult = await client.query(
            `SELECT id, order_status
             FROM orders
             WHERE id = $1
             LIMIT 1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng.',
            });
        }

        if (orderResult.rows[0].order_status !== 'processing') {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: 'Đơn hàng không còn trong danh sách chờ nhận.',
            });
        }

        await client.query('COMMIT');
        return res.json({
            success: true,
            message: 'Đã từ chối đơn hàng (tạm thời không lưu lịch sử từ chối).',
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[driver][rejectOrder] error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi từ chối đơn hàng.',
        });
    } finally {
        client.release();
    }
};

exports.getMyOrders = async (req, res) => {
    const scope = String(req.query?.scope || 'active').toLowerCase();
    const isHistory = scope === 'history';

    try {
        const driver = await getDriverProfile(req.user.userId);
        const statusFilter = isHistory
            ? `da.status IN ('completed', 'cancelled')`
            : `da.status IN ('accepted', 'picking_up', 'delivering')`;

        const result = await foodPool.query(
            `SELECT
                 da.id AS assignment_id,
                 da.status AS assignment_status,
                 da.assigned_at,
                 da.completed_at,
                 o.id AS order_id,
                 o.order_code,
                 o.order_status,
                 o.total_amount,
                 o.delivery_fee,
                 o.delivery_address,
                 o.delivery_latitude,
                 o.delivery_longitude,
                 o.user_name,
                 o.user_phone,
                 o.created_at AS order_created_at,
                 r.id AS restaurant_id,
                 r.name AS restaurant_name,
                 r.address AS restaurant_address,
                 rl.latitude AS restaurant_latitude,
                 rl.longitude AS restaurant_longitude,
                 (o.order_status = 'delivering' AND da.status IN ('accepted', 'picking_up', 'delivering')) AS can_mark_delivered
             FROM delivery_assignments da
             JOIN orders o ON o.id = da.order_id
             JOIN restaurants r ON r.id = o.restaurant_id
             LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
             WHERE da.driver_id = $1
                 AND ${statusFilter}
             ORDER BY COALESCE(da.completed_at, da.assigned_at) DESC
             LIMIT 100`,
            [driver.id]
        );

        return res.json({
            success: true,
            scope: isHistory ? 'history' : 'active',
            count: result.rowCount,
            data: result.rows,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        console.error('[driver][getMyOrders] error:', error);
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 404 ? 'Không tìm thấy tài khoản tài xế.' : 'Lỗi hệ thống khi lấy danh sách đơn của tài xế.',
        });
    }
};

exports.markAsDelivered = async (req, res) => {
    const orderId = Number(req.body?.order_id || req.params?.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'order_id không hợp lệ.',
        });
    }

    const client = await foodPool.connect();
    try {
        await client.query('BEGIN');
        const driver = await ensureDriverProfile(client, req.user.userId);

        const assignmentResult = await client.query(
            `SELECT da.id AS assignment_id,
                            da.status AS assignment_status,
                            o.id AS order_id,
                            o.order_status,
                            o.delivery_fee
             FROM delivery_assignments da
             JOIN orders o ON o.id = da.order_id
             WHERE da.order_id = $1
                 AND da.driver_id = $2
             FOR UPDATE`,
            [orderId, driver.id]
        );

        if (assignmentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Bạn không có assignment cho đơn hàng này.',
            });
        }

        const assignment = assignmentResult.rows[0];
        if (!['accepted', 'picking_up', 'delivering'].includes(assignment.assignment_status)) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: 'Assignment hiện tại không thể chuyển sang hoàn tất.',
            });
        }

        if (assignment.order_status !== 'delivering') {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: 'Đơn hàng phải ở trạng thái delivering trước khi xác nhận hoàn tất.',
            });
        }

        await client.query(
            `UPDATE orders
             SET order_status = 'delivered',
                     updated_at = NOW()
             WHERE id = $1`,
            [orderId]
        );

        await client.query(
            `UPDATE delivery_assignments
             SET status = 'completed',
                     completed_at = NOW()
             WHERE id = $1`,
            [assignment.assignment_id]
        );

        await client.query(
            `INSERT INTO driver_earnings (driver_id, assignment_id, amount, type, earned_at)
             SELECT $1, $2, $3, 'delivery_fee', NOW()
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM driver_earnings
                 WHERE assignment_id = $2
             )`,
            [driver.id, assignment.assignment_id, Number(assignment.delivery_fee || 0)]
        );

        await client.query(
            `UPDATE drivers
             SET status = 'online',
                     total_deliveries = COALESCE(total_deliveries, 0) + 1,
                     updated_at = NOW()
             WHERE id = $1`,
            [driver.id]
        );

        await client.query('COMMIT');
        return res.json({
            success: true,
            message: 'Xác nhận giao hàng thành công.',
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[driver][markAsDelivered] error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi xác nhận giao hàng.',
        });
    } finally {
        client.release();
    }
};

exports.getWalletSummary = async (req, res) => {
    try {
        const driver = await getDriverProfile(req.user.userId);

        const summaryResult = await foodPool.query(
            `SELECT
                 COALESCE(SUM(amount), 0)::numeric(12,2) AS available_balance,
                 COALESCE(SUM(amount) FILTER (WHERE earned_at >= date_trunc('day', NOW())), 0)::numeric(12,2) AS today_earnings,
                 COALESCE(SUM(amount) FILTER (WHERE earned_at >= NOW() - INTERVAL '7 days'), 0)::numeric(12,2) AS week_earnings,
                 COALESCE(SUM(amount) FILTER (WHERE earned_at >= NOW() - INTERVAL '30 days'), 0)::numeric(12,2) AS month_earnings
             FROM driver_earnings
             WHERE driver_id = $1`,
            [driver.id]
        );

        const deliveriesResult = await foodPool.query(
            `SELECT
                 COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= NOW() - INTERVAL '7 days')::int AS completed_orders_week,
                 COUNT(*) FILTER (WHERE assigned_at >= NOW() - INTERVAL '7 days')::int AS accepted_count_week
             FROM delivery_assignments
             WHERE driver_id = $1`,
            [driver.id]
        );

        const rejectedCountWeek = 0;

        const breakdownResult = await foodPool.query(
            `WITH day_series AS (
                 SELECT generate_series(
                     date_trunc('day', NOW())::date - 6,
                     date_trunc('day', NOW())::date,
                     INTERVAL '1 day'
                 )::date AS day
             ),
             daily_earnings AS (
                 SELECT
                     DATE_TRUNC('day', earned_at)::date AS day,
                     COALESCE(SUM(amount), 0)::numeric(12,2) AS amount
                 FROM driver_earnings
                 WHERE driver_id = $1
                     AND earned_at >= NOW() - INTERVAL '7 days'
                 GROUP BY 1
             )
             SELECT
                 d.day,
                 COALESCE(e.amount, 0)::numeric(12,2) AS amount
             FROM day_series d
             LEFT JOIN daily_earnings e ON e.day = d.day
             ORDER BY d.day`,
            [driver.id]
        );

        const summary = summaryResult.rows[0] || {};
        const deliveries = deliveriesResult.rows[0] || { completed_orders_week: 0, accepted_count_week: 0 };
        const acceptedCountWeek = deliveries.accepted_count_week || 0;
        const acceptanceRate = null;

        return res.json({
            success: true,
            data: {
                available_balance: Number(summary.available_balance || 0),
                today_earnings: Number(summary.today_earnings || 0),
                week_earnings: Number(summary.week_earnings || 0),
                month_earnings: Number(summary.month_earnings || 0),
                completed_orders_week: Number(deliveries.completed_orders_week || 0),
                accepted_count_week: Number(acceptedCountWeek || 0),
                rejected_count_week: Number(rejectedCountWeek || 0),
                acceptance_rate_week: acceptanceRate,
                daily_breakdown: breakdownResult.rows.map((row) => ({
                    day: row.day,
                    amount: Number(row.amount || 0),
                })),
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        console.error('[driver][getWalletSummary] error:', error);
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 404 ? 'Không tìm thấy tài khoản tài xế.' : 'Lỗi hệ thống khi lấy thống kê ví tài xế.',
        });
    }
};
