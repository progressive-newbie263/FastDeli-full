-- ===========================================
-- DATABASE & TABLE DEFINITIONS
-- ===========================================

-- DATABASE
CREATE DATABASE db-food-deli;

-- ===========================================
-- TABLES
-- ===========================================

-- RESTAURANTS
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  image_url TEXT DEFAULT 'https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  delivery_time VARCHAR(50) DEFAULT '30-45 phút',
  delivery_fee DECIMAL(8,2) DEFAULT 15000,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FOOD CATEGORIES
CREATE TABLE food_categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) UNIQUE NOT NULL
);

-- FOODS
CREATE TABLE foods (
  food_id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  food_name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT 'Chưa có mô tả về món ăn này',
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT DEFAULT 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_featured BOOLEAN DEFAULT FALSE,

  -- CHÚ Ý: không đặt NOT NULL ngay từ đầu để tiện chèn dữ liệu trước,
  -- sau khi migrate xong mới ALTER thành NOT NULL
  primary_category_id INTEGER REFERENCES food_categories(category_id),
  secondary_category_id INTEGER REFERENCES food_categories(category_id)
);

-- ORDERS
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_code VARCHAR(20) UNIQUE,  -- Mã đơn hàng công khai (ORD20250916-000001)
  user_id INTEGER NOT NULL,       -- Tham chiếu tới users ở DB khác
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),

  user_name VARCHAR(100) NOT NULL,
  user_phone VARCHAR(15) NOT NULL,
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,

  order_status VARCHAR(30) DEFAULT 'pending',   -- pending, confirmed, processing, delivering, delivered, cancelled
  payment_status VARCHAR(30) DEFAULT 'pending', -- pending, paid, refunded
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDER ITEMS
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  food_id INTEGER NOT NULL REFERENCES foods(food_id),
  food_name VARCHAR(150) NOT NULL,
  food_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REVIEWS
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  user_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BANNERS (Hero section)
CREATE TABLE banners (
  banner_id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  subtitle VARCHAR(500),
  image_url TEXT NOT NULL,
  link_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES (tối ưu truy vấn)
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_foods_restaurant ON foods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);

-- ===========================================
-- TRIGGERS
-- ===========================================
-- Tự động sinh order_code ngay sau khi tạo đơn
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_code := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_code
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_code();

-- ===========================================
-- SAMPLE DATA (mẫu test)
-- ===========================================

-- Danh mục món ăn
INSERT INTO food_categories (category_name) VALUES
('Cơm'), ('Gà'), ('Cháo'), ('Bánh mì'),
('Đồ ăn nhanh'), ('Đồ uống'), ('Tráng miệng'), ('Khác');

-- Nhà hàng mẫu
INSERT INTO restaurants (name, address, phone, image_url, description, delivery_time, delivery_fee, rating, total_reviews, is_featured)
VALUES
('Quán Cơm Tấm Sài Gòn', '123 Nguyễn Huệ, Q1, TP.HCM', '0901234567', 'https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-1.jpg', 'Cơm tấm ngon, giá rẻ', '20-30 phút', 15000, 4.5, 1250, true),
('Pizza House', '456 Lê Lợi, Q1, TP.HCM', '0902345678', 'https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-2.jpg', 'Pizza Ý chính hiệu', '35-45 phút', 20000, 4.2, 890, true),
('Trà Sữa Golden', '789 Trần Hưng Đạo, Q1, TP.HCM', '0903456789', 'https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-3.jpg', 'Trà sữa tươi ngon', '15-25 phút', 10000, 4.7, 2100, false),
('Kem Tràng Tiền', '123 Hai Bà Trưng, Hà Nội', '0920007778', 'https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-4.jpg', 'Kem chuẩn vị Tràng Tiền', '10-20 phút', 15000, 4.6, 752, false);

-- Món ăn mẫu
INSERT INTO foods (restaurant_id, food_name, description, price, primary_category_id, secondary_category_id)
VALUES
(1, 'Cơm Tấm Sườn Nướng', 'Cơm tấm với sườn nướng thơm ngon', 45000, 1, 2),
(1, 'Cơm Tấm Bì Chả', 'Cơm tấm truyền thống với bì và chả', 40000, 1, 8),
(1, 'Nước Ngọt', 'Coca Cola, Pepsi, 7Up', 15000, 6, NULL),
(2, 'Pizza Margherita', 'Pizza cơ bản với phô mai và cà chua', 120000, 5, 8),
(2, 'Pizza Hải Sản', 'Pizza với tôm, mực, cua', 180000, 5, 8),
(2, 'Nước Cam Tươi', 'Nước cam vắt tươi', 25000, 6, NULL),
(3, 'Trà Sữa Truyền Thống', 'Trà sữa đài loan chính hiệu', 30000, 6, 8),
(3, 'Trà Sữa Matcha', 'Trà sữa vị matcha Nhật Bản', 35000, 6, 8),
(3, 'Bánh Flan', 'Bánh flan mềm mịn', 20000, 7, NULL);



-- ============================================
-- MIGRATION: Add role to users & Drop user_roles
-- Date: 2025-12-18
-- ============================================
\c db_shared_deli

-- STEP 1: Backup trước khi sửa (recommended)
CREATE TABLE users_backup_20251218 AS SELECT * FROM users;
CREATE TABLE user_roles_backup_20251218 AS SELECT * FROM user_roles;

-- STEP 2: Thêm cột role vào users
ALTER TABLE users 
ADD COLUMN role VARCHAR(50) DEFAULT 'customer';

-- STEP 3: Migrate data từ user_roles sang users.role
UPDATE users u
SET role = (
  SELECT role_name 
  FROM user_roles ur 
  WHERE ur.user_id = u.user_id 
  LIMIT 1
);

-- STEP 4: Kiểm tra có user nào thiếu role không
SELECT user_id, full_name, email, role 
FROM users 
WHERE role IS NULL;

-- Nếu có NULL, set default
UPDATE users SET role = 'customer' WHERE role IS NULL;

-- STEP 5: Set NOT NULL constraint
ALTER TABLE users 
ALTER COLUMN role SET NOT NULL;

-- STEP 6: Thêm CHECK constraint (data validation)
ALTER TABLE users
ADD CONSTRAINT check_user_role 
CHECK (role IN ('customer', 'restaurant_owner', 'admin', 'shipper'));

-- STEP 7: Tạo index cho performance
CREATE INDEX idx_users_role ON users(role);

-- STEP 8: Xóa bảng user_roles (không cần nữa)
DROP TABLE user_roles CASCADE;

-- STEP 9: Verify migration
SELECT 
  role, 
  COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;

-- STEP 10: Check structure
\d users

-- ============================================
-- ROLLBACK PLAN (nếu cần)
-- ============================================
-- DROP TABLE IF EXISTS user_roles;
-- CREATE TABLE user_roles AS SELECT * FROM user_roles_backup_20251218;
-- ALTER TABLE users DROP COLUMN role;
-- DROP TABLE users_backup_20251218;
-- DROP TABLE user_roles_backup_20251218;
-- ============================================