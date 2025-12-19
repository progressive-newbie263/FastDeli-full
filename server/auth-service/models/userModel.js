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
      role = 'customer' 
    } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // avatar mặc định
    const avatar_url = config.defaultAvatarUrl;

    const query = `
      INSERT INTO users 
        (phone_number, email, password_hash, full_name, gender, date_of_birth, avatar_url, role) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        user_id, phone_number, email, full_name, gender, date_of_birth, avatar_url, role, created_at
    `;

    try {
      const result = await db.query(query, [
        phone_number, 
        email, 
        password_hash, 
        full_name, 
        gender, 
        date_of_birth,
        avatar_url,
        role
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
             date_of_birth, avatar_url, is_active, role
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
             date_of_birth, avatar_url, is_active, role, created_at 
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

  // Create user role (defaults to customer for food service)
  // async createUserRole(user_id) {
  //   const query = `
  //     INSERT INTO user_roles (user_id, role_name, service)
  //     VALUES ($1, 'customer', 'food')
  //     RETURNING role_id, user_id, role_name, service
  //   `;
    
  //   try {
  //     const result = await db.query(query, [user_id]);
  //     return result.rows[0];
  //   } catch (error) {
  //     throw error;
  //   }
  // }
};

module.exports = User;