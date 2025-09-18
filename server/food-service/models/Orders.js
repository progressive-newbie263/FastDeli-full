const { foodPool } = require('../config/db');

class Order {
  // 🆕 Tạo đơn hàng
  static async createOrder(orderData, items) {
    const client = await foodPool.connect();
    try {
      await client.query('BEGIN');

      const {
        user_id,
        restaurant_id,
        user_name,
        user_phone,
        delivery_address,
        notes,
        delivery_fee = 0
      } = orderData;

      // Tính tổng tiền từ items
      let total_items_amount = 0;
      for (const item of items) {
        total_items_amount += Number(item.food_price) * Number(item.quantity);
      }

      const total_amount = total_items_amount + Number(delivery_fee);

      // Thêm bản ghi order (id được tạo tự động)
      const orderInsertQuery = `
        INSERT INTO orders (
          user_id, restaurant_id, user_name, user_phone,
          delivery_address, notes, delivery_fee, total_amount,
          order_status, payment_status, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          'pending', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
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
          order.id, // dùng id mới
          food_id,
          food_name,
          food_price,
          quantity
        ]);
      }

      await client.query('COMMIT');
      return order; // trả về cả id & order_code để frontend hiển thị
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }


  // Lấy danh sách đơn theo user_id
  static async getOrdersByUserId(userId) {
    const client = await foodPool.connect();

    try {
      const query = `
        SELECT 
          o.id,
          o.order_code,
          o.user_id,
          o.restaurant_id,
          r.name AS restaurant_name,
          r.image_url AS restaurant_image,
          o.user_name,
          o.user_phone,
          o.delivery_address,
          o.total_amount,
          o.delivery_fee,
          o.order_status,
          o.payment_status,
          o.notes,
          o.created_at,
          o.updated_at
        FROM orders o
        LEFT JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
      `;

      const { rows } = await client.query(query, [userId]);
      return rows;
    } catch (err) {
      console.error("[getOrdersByUserId] lỗi khi lấy danh sách đơn hàng:", err);
      throw err;
    } finally {
      client.release();
    }
  };


  // Lấy chi tiết đơn hàng theo id (hoặc order_code)
  static async getOrderById(orderIdOrCode) {
    const client = await foodPool.connect();
    try {
      // Cho phép tìm theo id hoặc order_code
      const orderRes = await client.query(
        `SELECT * FROM orders WHERE id = $1 OR order_code = $1 LIMIT 1`,
        [orderIdOrCode]
      );

      if (orderRes.rows.length === 0) return null;
      const order = orderRes.rows[0];

      const itemsRes = await client.query(
        `SELECT order_item_id, order_id, food_id, food_name, food_price, quantity, created_at
         FROM order_items
         WHERE order_id = $1
         ORDER BY order_item_id`,
        [order.id]
      );

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

  
  static async updatePaymentStatus(orderIdOrCode, paymentStatus = 'paid', orderStatus = null) {
    const client = await foodPool.connect();
    try {
      let query;
      let values;

      if (orderStatus) {
        query = `
          UPDATE orders
          SET payment_status = $1,
              order_status = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3 OR order_code = $3::text
          RETURNING *
        `;
        values = [paymentStatus, orderStatus, orderIdOrCode];
      } else {
        query = `
          UPDATE orders
          SET payment_status = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 OR order_code = $2::text
          RETURNING *
        `;
        values = [paymentStatus, orderIdOrCode];
      }

      const res = await client.query(query, values);
      return res.rows[0];
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }

}

module.exports = Order;
