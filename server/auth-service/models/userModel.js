const db = require('../config/db');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const User = {
  // đăng kí/ tạo nguời dùng mới
  async create(userData) {
    const { 
      phone_number, 
      email, 
      password, 
      full_name, 
      gender, 
      date_of_birth, 
      role = 'customer',
      service = 'food'
    } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // avatar mặc định
    const avatar_url = config.defaultAvatarUrl;

    const query = `
      INSERT INTO users 
        (phone_number, email, password_hash, full_name, gender, date_of_birth, avatar_url, role, service) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        user_id, phone_number, email, full_name, gender, date_of_birth, avatar_url, role, service, created_at
    `;

    try {
      // Ensure service is an array if passed as a string
      const serviceArray = Array.isArray(service) ? service : [service];
      
      const result = await db.query(query, [
        phone_number, 
        email, 
        password_hash, 
        full_name, 
        gender, 
        date_of_birth,
        avatar_url,
        role,
        serviceArray
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Find user by email for login
  async findByEmail(email) {
    const query = `
      SELECT user_id, phone_number, email, password_hash, full_name, gender, 
             date_of_birth, avatar_url, is_active, role, service
      FROM users 
      WHERE email = $1
    `;
    
    try {
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Find user by phone number
  async findByPhone(phone_number) {
    const query = `
      SELECT user_id, phone_number, email 
      FROM users 
      WHERE phone_number = $1
    `;
    
    try {
      const result = await db.query(query, [phone_number]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Find user by ID
  async findById(user_id) {
    const query = `
      SELECT user_id, phone_number, email, full_name, gender, 
             date_of_birth, avatar_url, is_active, role, service, created_at 
      FROM users 
      WHERE user_id = $1
    `;
    
    try {
      const result = await db.query(query, [user_id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Add a service to an existing user's service array
  async addServiceToUser(user_id, newService) {
    const query = `
      UPDATE users 
      SET service = array_append(service, $2)
      WHERE user_id = $1 AND NOT ($2 = ANY(service))
      RETURNING user_id, email, service
    `;
    
    try {
      const result = await db.query(query, [user_id, newService]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
};

module.exports = User;