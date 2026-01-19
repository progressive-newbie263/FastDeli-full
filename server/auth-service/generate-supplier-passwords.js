/**
 * Script helper để generate password hash cho supplier demo accounts
 * Chạy: node generate-supplier-passwords.js
 */

const bcrypt = require('bcrypt');

const passwords = [
  { email: 'supplier@fastdeli.com', password: 'supplier123' },
  { email: 'supplier2@fastdeli.com', password: 'supplier123' },
  { email: 'supplier3@fastdeli.com', password: 'supplier123' }
];

async function generateHashes() {
  console.log('🔐 Generating password hashes for supplier accounts...\n');
  
  for (const account of passwords) {
    const hash = await bcrypt.hash(account.password, 10);
    console.log(`Email: ${account.email}`);
    console.log(`Password: ${account.password}`);
    console.log(`Hash: ${hash}`);
    console.log('---\n');
  }

  console.log('✅ Hoàn tất! Copy các hash trên vào file supplier_migration.sql');
  console.log('   Thay thế $2b$10$YourHashedPasswordHere bằng hash tương ứng\n');
}

generateHashes().catch(console.error);
