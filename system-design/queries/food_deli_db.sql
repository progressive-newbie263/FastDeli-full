-- TẠO DATABASE
CREATE DATABASE food_deli_db;

-- ===========================================
-- TABLES
-- ===========================================

-- RESTAURANTS
CREATE TABLE restaurants (
  restaurant_id SERIAL PRIMARY KEY,
  restaurant_name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  delivery_time VARCHAR(50) DEFAULT '30-45 phút',
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(8,2) DEFAULT 15000,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FOOD CATEGORIES
CREATE TABLE food_categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FOODS
CREATE TABLE foods (
  food_id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id),
  category_id INTEGER REFERENCES food_categories(category_id),
  food_name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL, -- Tham chiếu tới shared_db.users
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id),
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(15) NOT NULL,
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  order_status VARCHAR(30) DEFAULT 'pending', -- pending, confirmed, preparing, delivering, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDER ITEMS
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  food_id INTEGER NOT NULL REFERENCES foods(food_id),
  food_name VARCHAR(150) NOT NULL,
  food_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REVIEWS
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id),
  user_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id),
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

-- ✅ FEATURED ITEMS (không cần section)
CREATE TABLE featured_items (
  item_id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- Ví dụ: trending_food, suggested, promo_restaurant, etc.
  title VARCHAR(200),
  description TEXT,
  icon_url TEXT,
  image_url TEXT,
  restaurant_id INTEGER REFERENCES restaurants(restaurant_id),
  food_id INTEGER REFERENCES foods(food_id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_foods_restaurant ON foods(restaurant_id);
CREATE INDEX idx_foods_category ON foods(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_featured_items_type ON featured_items(type);

-- ===========================================
-- SAMPLE DATA
-- ===========================================

-- Danh mục món ăn
INSERT INTO food_categories (category_name) VALUES
('Món chính'), ('Món phụ'), ('Đồ uống'), ('Tráng miệng');

-- Banner hero section
INSERT INTO banners (title, subtitle, image_url, sort_order) VALUES
('Thưởng thức món ăn yêu thích tại nhà', 'Đặt món từ hàng ngàn nhà hàng và được giao hàng nhanh chóng', '/images/hero-banner.jpg', 1);


-- Nhà hàng mẫu
-- cần xử lí phần này chuẩn chỉ.
INSERT INTO restaurants (restaurant_name, address, phone, description, delivery_time, min_order_amount, delivery_fee, rating, total_reviews, is_featured) VALUES
('Quán Cơm Tấm Sài Gòn', '123 Nguyễn Huệ, Q1, TP.HCM', '0901234567', 'Cơm tấm ngon, giá rẻ', '20-30 phút', 30000, 15000, 4.5, 1250, true),
('Pizza House', '456 Lê Lợi, Q1, TP.HCM', '0902345678', 'Pizza Ý chính hiệu', '35-45 phút', 100000, 20000, 4.2, 890, true),
('Trà Sữa Golden', '789 Trần Hưng Đạo, Q1, TP.HCM', '0903456789', 'Trà sữa tươi ngon', '15-25 phút', 25000, 10000, 4.7, 2100, false),
('Kem Tràng Tiền', '123 Hai Bà Trưng, Hà Nội', '0920007778', 'Kem chuẩn vị Tràng Tiền', '10-20 phút', 60000, 15000, 4.6, 752, false);


-- Món ăn mẫu
INSERT INTO foods (restaurant_id, category_id, food_name, description, price) VALUES
-- Quán Cơm Tấm (id = 1)
(1, 1, 'Cơm Tấm Sườn Nướng', 'Cơm tấm với sườn nướng thơm ngon', 45000),
(1, 1, 'Cơm Tấm Bì Chả', 'Cơm tấm truyền thống với bì và chả', 40000),
(1, 3, 'Nước Ngọt', 'Coca Cola, Pepsi, 7Up', 15000),
-- Pizza House (id = 2)
(2, 1, 'Pizza Margherita', 'Pizza cơ bản với phô mai và cà chua', 120000),
(2, 1, 'Pizza Hải Sản', 'Pizza với tôm, mực, cua', 180000),
(2, 3, 'Nước Cam Tươi', 'Nước cam vắt tươi', 25000),
-- Trà Sữa Golden (id = 3)
(3, 3, 'Trà Sữa Truyền Thống', 'Trà sữa đài loan chính hiệu', 30000),
(3, 3, 'Trà Sữa Matcha', 'Trà sữa vị matcha Nhật Bản', 35000),
(3, 4, 'Bánh Flan', 'Bánh flan mềm mịn', 20000);


-- Món ăn nổi bật (featured_items)
-- Nhấn "ALt + Z" để hiển thị image_url trên 1 line duy nhất vscode.
INSERT INTO featured_items (type, title, description, image_url, food_id, sort_order) VALUES
('trending_food', 'Cơm Tấm Sườn Nướng', 'Món được đặt nhiều nhất tuần này', '', 1, 1),
('trending_food', 'Pizza Hải Sản', 'Pizza thịnh hành nhất', '', 5, 2),
('suggested', 'Trà Sữa Matcha', 'Món uống gợi ý cho bạn', '', 8, 3);
