const { Pool } = require('pg');
require('dotenv').config();

//foodPool là database nối đến db-food-deli. 
// Nó chuyên dụng cho mọi thứ liên quan đến 'food deli' 
// đây cũng chính là tính năng chủ đạo của web này
const foodPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.FOOD_DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// sharedPool là database nối đến db-shared-deli.
// chủ yếu xử lí tính năng về tài khoản/đăng nhập.
// ko có logic nào ở đây, chỉ là nối lại thôi. xử lí logic của nó bên server/auth-service là đủ rồi.
const sharedPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.AUTH_DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Kết nối (test)
foodPool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully!');
  }
});

module.exports = { foodPool, sharedPool };