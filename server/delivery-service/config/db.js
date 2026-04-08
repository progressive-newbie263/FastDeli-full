const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../food-service/.env'),
  path.resolve(__dirname, '../../auth-service/.env'),
];

envCandidates.forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
});

const dbPort = Number(process.env.DB_PORT || 5432);

const foodPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.FOOD_DB_NAME || 'db-food-deli',
  password: process.env.DB_PASSWORD,
  port: Number.isFinite(dbPort) ? dbPort : 5432,
});

const sharedPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.AUTH_DB_NAME || 'db-shared-deli',
  password: process.env.DB_PASSWORD,
  port: Number.isFinite(dbPort) ? dbPort : 5432,
});

module.exports = {
  foodPool,
  sharedPool,
  query: (text, params) => foodPool.query(text, params),
  pool: foodPool,
};
