const { foodPool } = require('../config/db');

class Order {
  // Lấy tất cả đơn hàng (cho admin)
  static async getAllOrders(filters = {}) {
    let query = `
      SELECT 
        o.*,
        r.name as restaurant_name,
        r.address as restaurant_address,
        r.phone as restaurant_phone
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Filter theo order_status
    if (filters.order_status) {
      query += ` AND o.order_status = $${paramIndex}`;
      params.push(filters.order_status);
      paramIndex++;
    }

    // Filter theo payment_status
    if (filters.payment_status) {
      query += ` AND o.payment_status = $${paramIndex}`;
      params.push(filters.payment_status);
      paramIndex++;
    }

    // Filter theo restaurant_id
    if (filters.restaurant_id) {
      query += ` AND o.restaurant_id = $${paramIndex}`;
      params.push(filters.restaurant_id);
      paramIndex++;
    }

    // Filter theo user_id
    if (filters.user_id) {
      query += ` AND o.user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'DESC';
    query += ` ORDER BY o.${sortBy} ${sortOrder}`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
      
      if (filters.page && filters.page > 1) {
        const offset = (filters.page - 1) * filters.limit;
        query += ` OFFSET $${paramIndex}`;
        params.push(offset);
      }
    }

    const result = await foodPool.query(query, params);
    return result.rows;
  }

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
        delivery_latitude = null,
        delivery_longitude = null,
        notes,
        delivery_fee = 0,
        payment_method = 'cash',
        coupon_id = null,
        coupon_code = null,
        discount_amount = 0,
        original_total = null,
        total_amount: providedTotalAmount = null
      } = orderData;

      // Tính tổng tiền từ items
      let total_items_amount = 0;
      for (const item of items) {
        total_items_amount += Number(item.food_price) * Number(item.quantity);
      }

      const calculatedOriginalTotal = total_items_amount + Number(delivery_fee);
      const parsedOriginalTotal = Number(original_total);
      const normalizedCouponCode =
        typeof coupon_code === 'string' && coupon_code.trim().length > 0
          ? coupon_code.trim().toUpperCase()
          : null;

      const parsedDiscountAmount = Number(discount_amount);
      let safeDiscountAmount = Number.isFinite(parsedDiscountAmount) && parsedDiscountAmount > 0
        ? parsedDiscountAmount
        : 0;

      const hasProvidedTotalAmount =
        providedTotalAmount !== null &&
        providedTotalAmount !== undefined &&
        Number.isFinite(Number(providedTotalAmount));

      const parsedProvidedTotalAmount = hasProvidedTotalAmount
        ? Math.max(Number(providedTotalAmount), 0)
        : null;

      const safeOriginalTotal = Number.isFinite(parsedOriginalTotal) && parsedOriginalTotal > 0
        ? parsedOriginalTotal
        : hasProvidedTotalAmount
          ? Math.max((parsedProvidedTotalAmount || 0) + safeDiscountAmount, calculatedOriginalTotal)
          : calculatedOriginalTotal;

      if (safeDiscountAmount <= 0 && hasProvidedTotalAmount && (parsedProvidedTotalAmount || 0) < safeOriginalTotal) {
        safeDiscountAmount = Math.max(safeOriginalTotal - (parsedProvidedTotalAmount || 0), 0);
      }

      const total_amount = hasProvidedTotalAmount
        ? (parsedProvidedTotalAmount || 0)
        : Math.max(safeOriginalTotal - safeDiscountAmount, 0);

      const normalizedTotalAmount = normalizedCouponCode && safeDiscountAmount > 0 && total_amount >= safeOriginalTotal
        ? Math.max(safeOriginalTotal - safeDiscountAmount, 0)
        : total_amount;

      // Thêm bản ghi order (id được tạo tự động)
      const orderInsertQuery = `
        INSERT INTO orders (
          user_id, restaurant_id, user_name, user_phone,
          delivery_address, delivery_latitude, delivery_longitude, notes, delivery_fee, total_amount,
          coupon_id, coupon_code, discount_amount, original_total,
          order_status, payment_status, payment_method, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          'pending', 'pending', $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
      `;

      const orderResult = await client.query(orderInsertQuery, [
        user_id || null,
        restaurant_id,
        user_name,
        user_phone,
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        notes || '',
        delivery_fee,
        normalizedTotalAmount,
        coupon_id,
        normalizedCouponCode,
        safeDiscountAmount,
        safeOriginalTotal,
        payment_method
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
          first_item.image_url AS order_preview_image,
          first_item.food_name AS order_preview_name,
          o.user_name,
          o.user_phone,
          o.delivery_address,
          o.total_amount,
          o.delivery_fee,
          o.coupon_id,
          o.coupon_code,
          o.discount_amount,
          o.original_total,
          o.order_status,
          o.payment_status,
          o.notes,
          o.created_at,
          o.updated_at
        FROM orders o
        LEFT JOIN restaurants r ON o.restaurant_id = r.id
        LEFT JOIN LATERAL (
          SELECT oi.food_name, f.image_url
          FROM order_items oi
          LEFT JOIN foods f ON f.food_id = oi.food_id
          WHERE oi.order_id = o.id
          ORDER BY oi.order_item_id ASC
          LIMIT 1
        ) first_item ON TRUE
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
      // Kiểm tra xem orderIdOrCode là số hay string
      const isNumeric = !isNaN(orderIdOrCode) && !isNaN(parseFloat(orderIdOrCode));
      
      let orderRes;
      if (isNumeric) {
        // Tìm theo id (integer)
        orderRes = await client.query(
          `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
          [parseInt(orderIdOrCode)]
        );
      } else {
        // Tìm theo order_code (varchar)
        orderRes = await client.query(
          `SELECT * FROM orders WHERE order_code = $1 LIMIT 1`,
          [orderIdOrCode]
        );
      }

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

  static async cancelOrder(orderId) {
    const client = await foodPool.connect();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `SELECT id, order_status, created_at, payment_status 
        FROM orders 
        WHERE id = $1 LIMIT 1`,
        [orderId]
      );

      if (res.rows.length === 0) {
        throw new Error('NOT_FOUND');
      }

      const order = res.rows[0];

      // Nếu đã cancel hoặc delivered => không hủy nữa
      if (order.order_status === 'cancelled' || order.order_status === 'delivered') {
        throw new Error('ALREADY_PROCESSED');
      }

      // Kiểm tra giới hạn 5 phút
      const diffMinutes = (Date.now() - new Date(order.created_at).getTime()) / 60000;
      if (diffMinutes > 5) {
        throw new Error('EXPIRED');
      }

      // Cập nhật trạng thái order + payment_status
      const updateQuery = `
        UPDATE orders
        SET order_status = 'cancelled',
            payment_status = CASE 
              WHEN payment_status = 'paid' THEN 'refunded'
              ELSE payment_status
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
      `;

      const updateRes = await client.query(updateQuery, [orderId]);
      await client.query('COMMIT');
      return updateRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = Order;
