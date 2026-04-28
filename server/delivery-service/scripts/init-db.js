const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
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

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || '26032004',
  port: Number(process.env.DB_PORT || 5432),
};

const DB_NAME = 'db-express-deli';

async function initialize() {
  const client = new Client({ ...config, database: 'postgres' });
  
  try {
    await client.connect();
    console.log('Connected to postgres database.');

    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
    
    if (res.rowCount === 0) {
      console.log(`Database ${DB_NAME} does not exist. Creating...`);
      // CREATE DATABASE cannot be run in a transaction or with parameters in some cases
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database ${DB_NAME} created successfully.`);
    } else {
      console.log(`Database ${DB_NAME} already exists.`);
    }
    
    await client.end();

    // Connect to the new database to create tables
    const dbClient = new Client({ ...config, database: DB_NAME });
    await dbClient.connect();
    console.log(`Connected to ${DB_NAME}.`);

    // Create shipments table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        driver_id INTEGER,
        price DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'SEARCHING_DRIVER',
        item_type VARCHAR(100),
        item_weight VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create stops table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS stops (
        id SERIAL PRIMARY KEY,
        shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
        type VARCHAR(20), -- 'pickup' or 'dropoff'
        address TEXT,
        contact_name VARCHAR(100),
        contact_phone VARCHAR(20),
        note TEXT,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully.');
    await dbClient.end();
    console.log('Initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error during initialization:', err);
    process.exit(1);
  }
}

initialize();
