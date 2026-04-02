const { foodPool } = require('../../food-service/config/db');

async function initDriverTables() {
  // NOTE: Tạo bảng nếu chưa tồn tại để dev/test nhanh.
  // Production nên dùng migration chuẩn.
  await foodPool.query(`
    CREATE TABLE IF NOT EXISTS driver_locations (
      driver_user_id INTEGER PRIMARY KEY,
      latitude NUMERIC(9,6) NOT NULL,
      longitude NUMERIC(9,6) NOT NULL,
      is_online BOOLEAN DEFAULT true,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await foodPool.query(`
    CREATE TABLE IF NOT EXISTS virtual_driver_candidates (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      candidate_idx INTEGER NOT NULL,
      latitude NUMERIC(9,6) NOT NULL,
      longitude NUMERIC(9,6) NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(order_id, candidate_idx)
    );
  `);

  await foodPool.query(`
    CREATE TABLE IF NOT EXISTS order_driver_assignments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL UNIQUE,
      assigned_driver_user_id INTEGER NOT NULL,
      selected_virtual_candidate_idx INTEGER NOT NULL,
      assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await foodPool.query(`CREATE INDEX IF NOT EXISTS idx_virtual_driver_candidates_order_id ON virtual_driver_candidates(order_id);`);
  await foodPool.query(`CREATE INDEX IF NOT EXISTS idx_order_driver_assignments_assigned_driver ON order_driver_assignments(assigned_driver_user_id);`);
}

module.exports = { initDriverTables };

