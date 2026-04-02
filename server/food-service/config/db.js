const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function buildPoolConfig(databaseName) {
  const password = process.env.DB_PASSWORD;
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('DB_PASSWORD is missing in server/food-service/.env');
  }

  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: databaseName,
    password,
    port: Number(process.env.DB_PORT || 5432),
  };
}

//foodPool là database nối đến db-food-deli. 
// Nó chuyên dụng cho mọi thứ liên quan đến 'food deli' 
// đây cũng chính là tính năng chủ đạo của web này
const foodPool = new Pool(buildPoolConfig(process.env.FOOD_DB_NAME));

// sharedPool là database nối đến db-shared-deli.
// chủ yếu xử lí tính năng về tài khoản/đăng nhập.
// ko có logic nào ở đây, chỉ là nối lại thôi. xử lí logic của nó bên server/auth-service là đủ rồi.
const sharedPool = new Pool(buildPoolConfig(process.env.AUTH_DB_NAME));

// Kết nối (test)
foodPool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully!');
  }
});

module.exports = { foodPool, sharedPool };