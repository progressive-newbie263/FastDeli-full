const pool = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: service column string -> text[]');
    
    await client.query('BEGIN');

    // 1. Drop existing check constraint on service column
    // This constraint (likely ('food', 'delivery')) is now invalid for array types
    await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_service_check');

    // 2. Convert service column to text[] using ARRAY[service] mapping
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN service TYPE TEXT[] 
      USING CASE 
        WHEN service IS NULL THEN ARRAY['food']::TEXT[]
        ELSE ARRAY[service]::TEXT[]
      END
    `);

    // 3. Set default value for new users
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN service SET DEFAULT ARRAY['food']::TEXT[]
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
