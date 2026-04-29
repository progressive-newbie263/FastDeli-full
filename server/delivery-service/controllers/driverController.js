const { foodPool, deliveryPool, sharedPool } = require('../config/db');
const pricing = require('../utils/pricing');

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

        // 1. Fetch Food Orders
        const foodResult = await foodPool.query(
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
             SELECT *, 'food' as service_type
             FROM candidate_orders
             WHERE distance_km <= $3
             ORDER BY distance_km ASC
             LIMIT 50`,
            [latitude, longitude, radiusKm]
        );

        // 2. Fetch Delivery Shipments
        const deliveryResult = await deliveryPool.query(
            `WITH candidate_shipments AS (
                SELECT 
                    s.id as order_id,
                    'SHIP-' || s.id as order_code,
                    0 as restaurant_id,
                    'Lấy hàng: ' || p.address as restaurant_name,
                    p.address as restaurant_address,
                    d.contact_name as user_name,
                    d.contact_phone as user_phone,
                    d.address as delivery_address,
                    s.price as delivery_fee,
                    s.price as total_amount,
                    s.status as order_status,
                    p.lat as restaurant_latitude,
                    p.lng as restaurant_longitude,
                    (
                        6371 * acos(
                            LEAST(
                                1,
                                GREATEST(
                                    -1,
                                    cos(radians($1)) * cos(radians(p.lat)) * cos(radians(p.lng) - radians($2)) +
                                    sin(radians($1)) * sin(radians(p.lat))
                                )
                            )
                        )
                    ) AS distance_km
                FROM shipments s
                JOIN stops p ON p.shipment_id = s.id AND p.type = 'pickup'
                JOIN stops d ON d.shipment_id = s.id AND d.type = 'dropoff'
                WHERE s.status = 'SEARCHING_DRIVER'
                  AND s.driver_id IS NULL
            )
            SELECT *, 'delivery' as service_type
            FROM candidate_shipments
            WHERE distance_km <= $3
            ORDER BY distance_km ASC
            LIMIT 50`,
            [latitude, longitude, radiusKm]
        );

        // Merge and Sort
        const merged = [...foodResult.rows, ...deliveryResult.rows]
            .sort((a, b) => a.distance_km - b.distance_km)
            .slice(0, 50);

        return res.json({
            success: true,
            radius_km: radiusKm,
            count: merged.length,
            data: merged,
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

    const clientFood = await foodPool.connect();
    const clientDelivery = await deliveryPool.connect();
    
    try {
        await clientFood.query('BEGIN');
        await clientDelivery.query('BEGIN');

        const driver = await ensureDriverProfile(clientFood, req.user.userId);

        // 1. Try to find in Delivery Shipments first
        const shipResult = await clientDelivery.query(
            `UPDATE shipments 
             SET driver_id = $1, status = 'DRIVER_ACCEPTED', updated_at = NOW()
             WHERE id = $2 AND status = 'SEARCHING_DRIVER' AND driver_id IS NULL
             RETURNING id, 'SHIP-' || id as order_code, price as delivery_fee`,
            [driver.id, orderId]
        );

        if (shipResult.rows.length > 0) {
            await clientFood.query(
                `UPDATE drivers SET status = 'busy', updated_at = NOW() WHERE id = $1`,
                [driver.id]
            );
            await clientDelivery.query('COMMIT');
            await clientFood.query('COMMIT');
            
            return res.json({
                success: true,
                message: 'Nhận đơn giao hàng thành công.',
                data: shipResult.rows[0],
            });
        }

        // 2. Try to find in Food Orders
        const orderResult = await clientFood.query(
            `SELECT id, order_status FROM orders WHERE id = $1 FOR UPDATE`,
            [orderId]
        );

        if (orderResult.rows.length > 0 && orderResult.rows[0].order_status === 'processing') {
            const insertAssignment = await clientFood.query(
                `INSERT INTO delivery_assignments (order_id, driver_id, status, assigned_at)
                 VALUES ($1, $2, 'accepted', NOW())
                 ON CONFLICT (order_id) DO NOTHING
                 RETURNING id, order_id, driver_id, status, assigned_at`,
                [orderId, driver.id]
            );

            if (insertAssignment.rows.length > 0) {
                await clientFood.query(
                    `UPDATE drivers SET status = 'busy', updated_at = NOW() WHERE id = $1`,
                    [driver.id]
                );
                await clientDelivery.query('COMMIT');
                await clientFood.query('COMMIT');
                
                return res.json({
                    success: true,
                    message: 'Nhận đơn đồ ăn thành công.',
                    data: insertAssignment.rows[0],
                });
            }
        }

        await clientDelivery.query('ROLLBACK');
        await clientFood.query('ROLLBACK');
        return res.status(409).json({
            success: false,
            message: 'Đơn hàng không khả dụng hoặc đã có người nhận.',
        });

    } catch (error) {
        await clientDelivery.query('ROLLBACK');
        await clientFood.query('ROLLBACK');
        console.error('[driver][acceptOrder] error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi nhận đơn.',
        });
    } finally {
        clientFood.release();
        clientDelivery.release();
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
        
        // 1. Fetch Food Orders
        const foodStatusFilter = isHistory
            ? `da.status IN ('completed', 'cancelled')`
            : `da.status IN ('accepted', 'picking_up', 'delivering')`;

        const foodResult = await foodPool.query(
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
                 (o.order_status = 'delivering' AND da.status IN ('accepted', 'picking_up', 'delivering')) AS can_mark_delivered,
                 'food' as service_type
             FROM delivery_assignments da
             JOIN orders o ON o.id = da.order_id
             JOIN restaurants r ON r.id = o.restaurant_id
             LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
             WHERE da.driver_id = $1
                 AND ${foodStatusFilter}
             ORDER BY COALESCE(da.completed_at, da.assigned_at) DESC`,
            [driver.id]
        );

        // 2. Fetch Delivery Shipments
        const shipStatusFilter = isHistory
            ? `s.status = 'DELIVERED'`
            : `s.status IN ('DRIVER_ACCEPTED', 'PICKED_UP')`;

        const shipResult = await deliveryPool.query(
            `SELECT 
                s.id as assignment_id,
                CASE 
                    WHEN s.status = 'DRIVER_ACCEPTED' THEN 'accepted'
                    WHEN s.status = 'PICKED_UP' THEN 'picking_up'
                    WHEN s.status = 'DELIVERED' THEN 'completed'
                    ELSE 'cancelled'
                END as assignment_status,
                s.updated_at as assigned_at,
                CASE WHEN s.status = 'DELIVERED' THEN s.updated_at ELSE NULL END as completed_at,
                s.id as order_id,
                'SHIP-' || s.id as order_code,
                s.status as order_status,
                s.price as total_amount,
                s.price as delivery_fee,
                d.address as delivery_address,
                d.lat as delivery_latitude,
                d.lng as delivery_longitude,
                d.contact_name as user_name,
                d.contact_phone as user_phone,
                s.created_at as order_created_at,
                0 as restaurant_id,
                'Lấy: ' || p.address as restaurant_name,
                p.address as restaurant_address,
                p.lat as restaurant_latitude,
                p.lng as restaurant_longitude,
                (s.status = 'PICKED_UP') as can_mark_delivered,
                'delivery' as service_type
            FROM shipments s
            JOIN stops p ON p.shipment_id = s.id AND p.type = 'pickup'
            JOIN stops d ON d.shipment_id = s.id AND d.type = 'dropoff'
            WHERE s.driver_id = $1 AND ${shipStatusFilter}
            ORDER BY s.updated_at DESC`,
            [driver.id]
        );

        const merged = [...foodResult.rows, ...shipResult.rows]
            .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at))
            .slice(0, 100);

        return res.json({
            success: true,
            scope: isHistory ? 'history' : 'active',
            count: merged.length,
            data: merged,
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

    const clientFood = await foodPool.connect();
    const clientDelivery = await deliveryPool.connect();

    try {
        await clientFood.query('BEGIN');
        await clientDelivery.query('BEGIN');
        const driver = await ensureDriverProfile(clientFood, req.user.userId);

        // 1. Check if it's a Delivery Shipment
        const shipCheck = await clientDelivery.query(
            `SELECT id, status, price FROM shipments WHERE id = $1 AND driver_id = $2 FOR UPDATE`,
            [orderId, driver.id]
        );

        if (shipCheck.rows.length > 0) {
            const ship = shipCheck.rows[0];
            if (ship.status !== 'PICKED_UP') {
                 await clientDelivery.query('ROLLBACK');
                 await clientFood.query('ROLLBACK');
                 return res.status(409).json({ success: false, message: 'Đơn hàng phải ở trạng thái đã lấy hàng.' });
            }

            await clientDelivery.query(
                `UPDATE shipments SET status = 'DELIVERED', updated_at = NOW() WHERE id = $1`,
                [orderId]
            );

            // Record earnings
            await clientFood.query(
                `INSERT INTO driver_earnings (driver_id, assignment_id, amount, type, earned_at)
                 VALUES ($1, $2, $3, 'delivery_fee', NOW())`,
                [driver.id, orderId, ship.price]
            );

            await clientFood.query(
                `UPDATE drivers SET status = 'online', total_deliveries = COALESCE(total_deliveries, 0) + 1, updated_at = NOW() WHERE id = $1`,
                [driver.id]
            );

            await clientDelivery.query('COMMIT');
            await clientFood.query('COMMIT');
            return res.json({ success: true, message: 'Xác nhận giao hàng thành công.' });
        }

        // 2. Check if it's a Food Order
        const assignmentResult = await clientFood.query(
            `SELECT da.id AS assignment_id, da.status AS assignment_status, o.id AS order_id, o.order_status, o.delivery_fee
             FROM delivery_assignments da
             JOIN orders o ON o.id = da.order_id
             WHERE da.order_id = $1 AND da.driver_id = $2 FOR UPDATE`,
            [orderId, driver.id]
        );

        if (assignmentResult.rows.length > 0) {
            const assignment = assignmentResult.rows[0];
            if (assignment.order_status === 'delivering') {
                await clientFood.query(`UPDATE orders SET order_status = 'delivered', updated_at = NOW() WHERE id = $1`, [orderId]);
                await clientFood.query(`UPDATE delivery_assignments SET status = 'completed', completed_at = NOW() WHERE id = $1`, [assignment.assignment_id]);
                await clientFood.query(
                    `INSERT INTO driver_earnings (driver_id, assignment_id, amount, type, earned_at)
                     VALUES ($1, $2, $3, 'delivery_fee', NOW())`,
                    [driver.id, assignment.assignment_id, assignment.delivery_fee]
                );
                await clientFood.query(`UPDATE drivers SET status = 'online', total_deliveries = COALESCE(total_deliveries, 0) + 1, updated_at = NOW() WHERE id = $1`, [driver.id]);
                
                await clientDelivery.query('COMMIT');
                await clientFood.query('COMMIT');
                return res.json({ success: true, message: 'Xác nhận giao hàng thành công.' });
            }
        }

        await clientDelivery.query('ROLLBACK');
        await clientFood.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng phù hợp.' });

    } catch (error) {
        await clientDelivery.query('ROLLBACK');
        await clientFood.query('ROLLBACK');
        console.error('[driver][markAsDelivered] error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống.' });
    } finally {
        clientFood.release();
        clientDelivery.release();
    }
};

exports.getWalletSummary = async (req, res) => {
    try {
        const driver = await getDriverProfile(req.user.userId);

        const [summaryResult, deliveriesResult, breakdownResult, debtLedgerResult] = await Promise.all([
            foodPool.query(
                `SELECT
                     COALESCE(SUM(amount), 0)::numeric(12,2) AS available_balance,
                     COALESCE(SUM(amount) FILTER (WHERE earned_at >= date_trunc('day', NOW())), 0)::numeric(12,2) AS today_earnings,
                     COALESCE(SUM(amount) FILTER (WHERE earned_at >= NOW() - INTERVAL '7 days'), 0)::numeric(12,2) AS week_earnings,
                     COALESCE(SUM(amount) FILTER (WHERE earned_at >= NOW() - INTERVAL '30 days'), 0)::numeric(12,2) AS month_earnings
                 FROM driver_earnings
                 WHERE driver_id = $1`,
                [driver.id]
            ),
            foodPool.query(
                `SELECT
                     COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= NOW() - INTERVAL '7 days')::int AS completed_orders_week,
                     COUNT(*) FILTER (WHERE assigned_at >= NOW() - INTERVAL '7 days')::int AS accepted_count_week,
                     COUNT(*) FILTER (WHERE assigned_at >= date_trunc('day', NOW()))::int AS accepted_count_today,
                     COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= date_trunc('day', NOW()))::int AS completed_count_today,
                     COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_orders_total
                 FROM delivery_assignments
                 WHERE driver_id = $1`,
                [driver.id]
            ),
            foodPool.query(
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
            ),
            foodPool.query(
                `WITH day_series AS (
                     SELECT generate_series(
                         date_trunc('day', NOW())::date - 13,
                         date_trunc('day', NOW())::date,
                         INTERVAL '1 day'
                     )::date AS day
                 ),
                 accepted_daily AS (
                     SELECT
                         DATE(assigned_at) AS day,
                         COUNT(*)::int AS accepted_orders
                     FROM delivery_assignments
                     WHERE driver_id = $1
                       AND assigned_at >= date_trunc('day', NOW()) - INTERVAL '13 days'
                     GROUP BY DATE(assigned_at)
                 ),
                 completed_daily AS (
                     SELECT
                         DATE(completed_at) AS day,
                         COUNT(*)::int AS completed_orders
                     FROM delivery_assignments
                     WHERE driver_id = $1
                       AND status = 'completed'
                       AND completed_at IS NOT NULL
                       AND completed_at >= date_trunc('day', NOW()) - INTERVAL '13 days'
                     GROUP BY DATE(completed_at)
                 ),
                 earnings_daily AS (
                     SELECT
                         DATE(earned_at) AS day,
                         COALESCE(SUM(amount), 0)::numeric(12,2) AS gross_income
                     FROM driver_earnings
                     WHERE driver_id = $1
                       AND earned_at >= date_trunc('day', NOW()) - INTERVAL '13 days'
                     GROUP BY DATE(earned_at)
                 )
                 SELECT
                     ds.day,
                     COALESCE(ad.accepted_orders, 0)::int AS accepted_orders,
                     COALESCE(cd.completed_orders, 0)::int AS completed_orders,
                     COALESCE(ed.gross_income, 0)::numeric(12,2) AS gross_income
                 FROM day_series ds
                 LEFT JOIN accepted_daily ad ON ad.day = ds.day
                 LEFT JOIN completed_daily cd ON cd.day = ds.day
                 LEFT JOIN earnings_daily ed ON ed.day = ds.day
                 ORDER BY ds.day ASC`,
                [driver.id]
            ),
        ]);

        const summary = summaryResult.rows[0] || {};
        const deliveries = deliveriesResult.rows[0] || {
            completed_orders_week: 0,
            accepted_count_week: 0,
            accepted_count_today: 0,
            completed_count_today: 0,
            completed_orders_total: 0,
        };
        const acceptedCountWeek = deliveries.accepted_count_week || 0;
        const acceptanceRate = null;
        const todayEarnings = Number(summary.today_earnings || 0);
        const rejectedCountWeek = 0;

        return res.json({
            success: true,
            data: {
                available_balance: Number(summary.available_balance || 0),
                today_earnings: todayEarnings,
                today_gross_income: todayEarnings,
                today_net_income: todayEarnings,
                week_earnings: Number(summary.week_earnings || 0),
                month_earnings: Number(summary.month_earnings || 0),
                completed_orders_week: Number(deliveries.completed_orders_week || 0),
                accepted_count_week: Number(acceptedCountWeek || 0),
                today_orders_accepted: Number(deliveries.accepted_count_today || 0),
                today_orders_completed: Number(deliveries.completed_count_today || 0),
                total_completed_orders: Number(driver.total_deliveries || deliveries.completed_orders_total || 0),
                rejected_count_week: Number(rejectedCountWeek || 0),
                acceptance_rate_week: acceptanceRate,
                daily_breakdown: breakdownResult.rows.map((row) => ({
                    day: row.day,
                    amount: Number(row.amount || 0),
                })),
                debt_ledger: debtLedgerResult.rows.map((row) => {
                    const grossIncome = Number(row.gross_income || 0);
                    return {
                        day: row.day,
                        accepted_orders: Number(row.accepted_orders || 0),
                        completed_orders: Number(row.completed_orders || 0),
                        gross_income: grossIncome,
                        net_income: grossIncome,
                    };
                }),
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
