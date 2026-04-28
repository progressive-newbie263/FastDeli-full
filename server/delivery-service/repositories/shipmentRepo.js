const db = require('../config/db');

class ShipmentRepo {
    async createShipment(userId, price, pickup, dropoff, itemInfo = {}) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            const shipRes = await client.query(
                `INSERT INTO shipments (user_id, price, status, item_type, item_weight) 
                 VALUES ($1, $2, 'SEARCHING_DRIVER', $3, $4) RETURNING id`,
                [userId, price, itemInfo.type, itemInfo.weight]
            );
            const shipmentId = shipRes.rows[0].id;

            // Insert Pickup
            await client.query(
                `INSERT INTO stops (shipment_id, type, lat, lng, address, contact_name, contact_phone, note) 
                 VALUES ($1, 'pickup', $2, $3, $4, $5, $6, $7)`, 
                [shipmentId, pickup.lat, pickup.lng, pickup.address, pickup.contact_name, pickup.contact_phone, pickup.note]
            );
            
            // Insert Dropoff
            await client.query(
                `INSERT INTO stops (shipment_id, type, lat, lng, address, contact_name, contact_phone, note) 
                 VALUES ($1, 'dropoff', $2, $3, $4, $5, $6, $7)`, 
                [shipmentId, dropoff.lat, dropoff.lng, dropoff.address, dropoff.contact_name, dropoff.contact_phone, dropoff.note]
            );

            await client.query('COMMIT');
            return { id: shipmentId, price, status: 'SEARCHING_DRIVER', ...itemInfo };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async assignDriver(shipmentId, driverId) {
        const query = `
            UPDATE shipments 
            SET driver_id = $1, status = 'DRIVER_ACCEPTED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND status = 'SEARCHING_DRIVER'
            RETURNING *;
        `;
        const res = await db.query(query, [driverId, shipmentId]);
        return res.rowCount > 0 ? res.rows[0] : null; 
    }

    async updateStatus(shipmentId, status) {
        const query = `UPDATE shipments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
        const res = await db.query(query, [status, shipmentId]);
        return res.rows[0];
    }

    async getShipmentDetail(shipmentId) {
        const shipRes = await db.query('SELECT * FROM shipments WHERE id = $1', [shipmentId]);
        if (shipRes.rowCount === 0) return null;

        const stopsRes = await db.query('SELECT * FROM stops WHERE shipment_id = $1 ORDER BY id ASC', [shipmentId]);
        
        return {
            ...shipRes.rows[0],
            stops: stopsRes.rows
        };
    }

    async getShipmentsByUserId(userId) {
        const query = `
            SELECT s.*, 
                   p.address as pickup_address, 
                   d.address as dropoff_address
            FROM shipments s
            LEFT JOIN stops p ON p.shipment_id = s.id AND p.type = 'pickup'
            LEFT JOIN stops d ON d.shipment_id = s.id AND d.type = 'dropoff'
            WHERE s.user_id = $1
            ORDER BY s.created_at DESC
        `;
        const res = await db.query(query, [userId]);
        return res.rows;
    }
}

module.exports = new ShipmentRepo();
