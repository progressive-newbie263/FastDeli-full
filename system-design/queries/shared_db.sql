-- TẠO DATABASE
CREATE DATABASE db-shared-deli;

-- KẾT NỐI VỚI DATABASE
-- \c db-shared-deli;

-- BẢNG USERS (dùng chung cho tất cả dịch vụ)
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255),
  date_of_birth DATE,
  gender VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -- BẢNG USER ROLES (phân quyền người dùng)
CREATE TABLE user_roles (
  role_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  role_name VARCHAR(50) NOT NULL, -- customer, driver, merchant, admin
  service VARCHAR(50) NOT NULL, -- food, bike, express, all
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- tạm thời bỏ qua đống này đi.

-- -- BẢNG ADDRESSES (địa chỉ người dùng - dùng chung)
-- CREATE TABLE addresses (
--   address_id SERIAL PRIMARY KEY,
--   user_id INTEGER NOT NULL REFERENCES users(user_id),
--   address_type VARCHAR(20) NOT NULL, -- home, work, other
--   address_line VARCHAR(255) NOT NULL,
--   city VARCHAR(100) NOT NULL,
--   district VARCHAR(100) NOT NULL,
--   ward VARCHAR(100) NOT NULL,
--   latitude DECIMAL(10, 8),
--   longitude DECIMAL(11, 8),
--   is_default BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );



-- -- BẢNG PAYMENT METHODS (phương thức thanh toán của người dùng)
-- CREATE TABLE payment_methods (
--   payment_method_id SERIAL PRIMARY KEY,
--   user_id INTEGER NOT NULL REFERENCES users(user_id),
--   payment_type VARCHAR(50) NOT NULL, -- credit_card, bank_account
--   provider VARCHAR(50) NOT NULL, -- visa, mastercard, bank_name
--   account_number VARCHAR(50), -- encrypted
--   card_holder_name VARCHAR(100),
--   expiry_date VARCHAR(7), -- MM/YYYY
--   is_default BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- BẢNG TRANSACTIONS (lịch sử giao dịch của người dùng)
-- CREATE TABLE transactions (
--   transaction_id SERIAL PRIMARY KEY,
--   user_id INTEGER NOT NULL REFERENCES users(user_id),
--   service VARCHAR(50) NOT NULL, -- food, bike, express
--   related_order_id VARCHAR(100), -- ID đơn hàng từ các dịch vụ khác nhau
--   amount DECIMAL(12, 2) NOT NULL,
--   transaction_type VARCHAR(50) NOT NULL, -- payment, refund, top_up
--   payment_method_id INTEGER REFERENCES payment_methods(payment_method_id),
--   status VARCHAR(50) NOT NULL, -- success, failed, pending
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- BẢNG PROMOTIONS (mã khuyến mãi)
-- CREATE TABLE promotions (
--   promotion_id SERIAL PRIMARY KEY,
--   promotion_code VARCHAR(50) UNIQUE NOT NULL,
--   promotion_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, free_delivery
--   discount_value DECIMAL(10, 2) NOT NULL,
--   min_order_value DECIMAL(10, 2) DEFAULT 0,
--   max_discount_amount DECIMAL(10, 2),
--   start_date TIMESTAMP NOT NULL,
--   end_date TIMESTAMP NOT NULL,
--   is_active BOOLEAN DEFAULT TRUE,
--   usage_limit INTEGER, -- Số lần sử dụng tối đa
--   usage_count INTEGER DEFAULT 0, -- Số lần đã sử dụng
--   applicable_services VARCHAR(255), -- food, bike, express, all
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- BẢNG USER PROMOTIONS (liên kết người dùng với mã khuyến mãi)
-- CREATE TABLE user_promotions (
--   id SERIAL PRIMARY KEY,
--   user_id INTEGER NOT NULL REFERENCES users(user_id),
--   promotion_id INTEGER NOT NULL REFERENCES promotions(promotion_id),
--   is_used BOOLEAN DEFAULT FALSE,
--   used_at TIMESTAMP,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );