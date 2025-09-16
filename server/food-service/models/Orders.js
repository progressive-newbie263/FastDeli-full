const { foodPool } = require('../config/db');

class Order {
  // Tạo đơn hàng
  static async createOrder(orderData, items) {
    const client = await foodPool.connect();
    try {
      await client.query('BEGIN');

      // total_amount sẽ xử lí phía dưới
      const {
        user_id,
        restaurant_id,
        user_name,
        user_phone,
        delivery_address,
        notes,
        delivery_fee = 0
      } = orderData;

      // Tổng tiền từ items
      let total_items_amount = 0;
      for (const item of items) {
        total_items_amount += Number(item.food_price) * Number(item.quantity);
      }

      const total_amount = total_items_amount + Number(delivery_fee);

      // Thêm bản ghi order
      const orderInsertQuery = `
        INSERT INTO orders (
          user_id, restaurant_id, user_name, user_phone, delivery_address, notes, delivery_fee, total_amount,
          order_status, payment_status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          'pending', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING *
      `;

      const orderResult = await client.query(orderInsertQuery, [
        user_id || null,
        restaurant_id,
        user_name,
        user_phone,
        delivery_address,
        notes || '',
        delivery_fee,
        total_amount
      ]);

      const order = orderResult.rows[0];

      // Thêm các items
      const insertItemQuery = `
        INSERT INTO order_items (
          order_id, food_id, food_name, food_price, quantity, created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `;

      for (const item of items) {
        const { food_id, food_name, food_price, quantity } = item;
        await client.query(insertItemQuery, [
          order.order_id,
          food_id,
          food_name,
          food_price,
          quantity
        ]);
      }

      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Lấy đơn hàng theo user_id
  static async getOrdersByUserId(userId) {
    const client = await foodPool.connect();
    try {
      const query = `
        SELECT 
          order_id,
          user_id,
          restaurant_id,
          user_name,
          user_phone,
          delivery_address,
          total_amount,
          order_status,
          notes,
          created_at,
          updated_at,
          delivery_fee,
          payment_status
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;

      const { rows } = await client.query(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Lấy chi tiết đơn hàng theo order_id
  static async getOrderById(orderId) {
    const client = await foodPool.connect();
    try {
      const orderRes = await client.query(
        `SELECT * FROM orders WHERE order_id = $1`,
        [orderId]
      );

      if (orderRes.rows.length === 0) return null;
      const order = orderRes.rows[0];

      const itemsRes = await client.query(
        `SELECT order_item_id, order_id, food_id, food_name, food_price, quantity, created_at
         FROM order_items
         WHERE order_id = $1
         ORDER BY order_item_id`,
        [orderId]
      );

      // Tính subtotal động
      order.items = itemsRes.rows.map((item) => ({
        ...item,
        subtotal: Number(item.food_price) * Number(item.quantity)
      }));

      return order;
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }

  // Cập nhật trạng thái thanh toán
  static async updatePaymentStatus(orderId, paymentStatus = 'paid', orderStatus = null) {
    const client = await foodPool.connect();
    try {
      if (orderStatus) {
        const q = `
          UPDATE orders
          SET payment_status = $1, order_status = $2, updated_at = CURRENT_TIMESTAMP
          WHERE order_id = $3 RETURNING *
        `;
        const res = await client.query(q, [paymentStatus, orderStatus, orderId]);
        return res.rows[0];
      } else {
        const q = `
          UPDATE orders
          SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE order_id = $2 RETURNING *
        `;
        const res = await client.query(q, [paymentStatus, orderId]);
        return res.rows[0];
      }
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = Order;
