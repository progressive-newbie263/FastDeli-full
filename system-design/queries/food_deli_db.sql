-- TẠO DATABASE
CREATE DATABASE db-food-deli;

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
  delivery_fee DECIMAL(8,2) DEFAULT 15000,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- bổ sung
ALTER TABLE restaurants
ALTER COLUMN image_url SET DEFAULT 'https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg';


-- FOOD CATEGORIES
CREATE TABLE food_categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) UNIQUE NOT NULL
);


----------------------------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- FOODS
CREATE TABLE foods (
  food_id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id),
  food_name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT 'Chưa có mô tả về món ăn này',
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT DEFAULT 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_featured BOOLEAN DEFAULT FALSE,

  -- bổ sung 2 thuộc tính này:
  -- Lưu ý quan trọng. Ko đặt thẳng not null từ đầu. Hãy làm kiểu, ko ghi gì, sau chèn dữ liệu rồi alter cái primary sang not null sau.
  primary_category_id INTEGER REFERENCES food_categories(category_id),
  secondary_category_id INTEGER REFERENCES food_categories(category_id),
);

-- Món ăn mẫu
INSERT INTO foods (restaurant_id, food_name, description, price, primary_category_id, secondary_category_id)
VALUES
(1, 'Cơm Tấm Sườn Nướng', 'Cơm tấm với sườn nướng thơm ngon', 45000, 1, 2), -- Cơm > Gà
(1, 'Cơm Tấm Bì Chả', 'Cơm tấm truyền thống với bì và chả', 40000, 1, 8),    -- Cơm > Khác
(1, 'Nước Ngọt', 'Coca Cola, Pepsi, 7Up', 15000, 6, NULL);                   -- Đồ uống, không secondary

-- Món ăn của Pizza House (restaurant_id = 2)
INSERT INTO foods (restaurant_id, food_name, description, price, primary_category_id, secondary_category_id)
VALUES
(2, 'Pizza Margherita', 'Pizza cơ bản với phô mai và cà chua', 120000, 5, 8), -- Đồ ăn nhanh > Khác
(2, 'Pizza Hải Sản', 'Pizza với tôm, mực, cua', 180000, 5, 8),
(2, 'Nước Cam Tươi', 'Nước cam vắt tươi', 25000, 6, NULL);

-- Món ăn của Trà Sữa Golden (restaurant_id = 3)
INSERT INTO foods (restaurant_id, food_name, description, price, primary_category_id, secondary_category_id)
VALUES
(3, 'Trà Sữa Truyền Thống', 'Trà sữa đài loan chính hiệu', 30000, 6, 8),
(3, 'Trà Sữa Matcha', 'Trà sữa vị matcha Nhật Bản', 35000, 6, 8),
(3, 'Bánh Flan', 'Bánh flan mềm mịn', 20000, 7, NULL); -- Tráng miệng, không secondary
----------------------------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------------------------------------



-- ORDERS
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL, -- Tham chiếu tới shared_db.users
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id),
  user_name VARCHAR(100) NOT NULL,
  user_phone VARCHAR(15) NOT NULL,
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


-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_foods_restaurant ON foods(restaurant_id);
-- CREATE INDEX idx_foods_category ON foods(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);


-- ===========================================
-- SAMPLE DATA
-- ===========================================

-- Danh mục món ăn
INSERT INTO food_categories (category_name) VALUES
('Cơm'), 
('Gà'), 
('Cháo'), 
('Bánh mì'), 
('Đồ ăn nhanh'), 
('Đồ uống'), 
('Tráng miệng'), 
('Khác');

-- Banner hero section
-- INSERT INTO banners (title, subtitle, image_url, sort_order) VALUES
-- ('Thưởng thức món ăn yêu thích tại nhà', 'Đặt món từ hàng ngàn nhà hàng và được giao hàng nhanh chóng', '/images/hero-banner.jpg', 1);


-- Nhà hàng mẫu
-- cần xử lí phần này chuẩn chỉ.
INSERT INTO restaurants (
  restaurant_name,
  address,
  phone,
  image_url,
  description,
  delivery_time,
  delivery_fee,
  rating,
  total_reviews,
  is_featured
) 
VALUES
('Quán Cơm Tấm Sài Gòn', '123 Nguyễn Huệ, Q1, TP.HCM', '0901234567', 'https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-1.jpg', 'Cơm tấm ngon, giá rẻ', '20-30 phút', 15000, 4.5, 1250, true),
('Pizza House', '456 Lê Lợi, Q1, TP.HCM', '0902345678', 'https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-2.jpg', 'Pizza Ý chính hiệu', '35-45 phút', 20000, 4.2, 890, true),
('Trà Sữa Golden', '789 Trần Hưng Đạo, Q1, TP.HCM', '0903456789', 'https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-3.jpg', 'Trà sữa tươi ngon', '15-25 phút', 10000, 4.7, 2100, false),
('Kem Tràng Tiền', '123 Hai Bà Trưng, Hà Nội', '0920007778', 'https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-4.jpg', 'Kem chuẩn vị Tràng Tiền', '10-20 phút', 15000, 4.6, 752, false);



-- bổ sung ảnh cho các danh mục món ăn
UPDATE food_categories
SET image_url = 'https://res.cloudinary.com/dpldznnma/foods/category=com'
WHERE category_name = 'Cơm';

UPDATE food_categories
SET image_url = 'https://res.cloudinary.com/dpldznnma/foods/category=ga'
WHERE category_name = 'Gà';

UPDATE food_categories
SET image_url = 'https://res.cloudinary.com/dpldznnma/foods/category=chao'
WHERE category_name = 'Cháo';

UPDATE food_categories
SET image_url = 'https://res.cloudinary.com/dpldznnma/foods/category=banh-mi'
WHERE category_name = 'Bánh mì';

UPDATE food_categories
SET image_url = 'https://res.cloudinary.com/dpldznnma/foods/category=do-an-nhanh'
WHERE category_name = 'Đồ ăn nhanh';

UPDATE food_categories
SET image_url = 'https://res.cloudinary.com/dpldznnma/foods/category=do-uong'
WHERE category_name = 'Đồ uống';

UPDATE food_categories
SET image_url = 'https://res.cloudinary.com/dpldznnma/foods/category=trang-mieng'
WHERE category_name = 'Tráng miệng';

UPDATE food_categories
SET image_url = 'https://res.cloudinary.com/dpldznnma/foods/category=khac'
WHERE category_name = 'Khác';



------------------------ 7/7/2025 -----------------------------------------------
INSERT INTO restaurants (
  restaurant_name,
  address,
  phone,
  description,
  delivery_time,
  delivery_fee,
  rating,
  total_reviews,
  is_featured
) VALUES
('Mì Vằn Thắn Gia Truyền', '30 Nguyễn Ngọc Vũ, Trung Hòa, Hà Nội', '0901111017', 'Mì vằn thắn thơm ngon, nước lèo đậm vị', '20-25 phút', 7000, 4.6, 920, false),
('Bánh Cuốn Nóng Gia Truyền', '102 Trần Quốc Vượng, Cầu Giấy, Hà Nội', '0901111019', 'Bánh cuốn nóng nhân thịt truyền thống', '15-20 phút', 5000, 4.2, 600, false),
('Nem Nướng Nha Trang', '99 Nguyễn Hoàng, Nam Từ Liêm, Hà Nội', '0901111020', 'Nem nướng giòn, nước chấm đặc biệt', '20-30 phút', 10000, 4.6, 860, false),
('Chè Dừa Thái Lan', '77 Trần Quốc Hoàn, Cầu Giấy, Hà Nội', '0901111021', 'Chè dừa Thái mát lạnh, ngọt dịu', '15-25 phút', 6000, 4.5, 900, true),
('Ốc Cay Sài Gòn', '59 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội', '0901111022', 'Ốc cay chuẩn vị miền Nam', '30-45 phút', 15000, 4.3, 720, false),
('Cơm Bình Dân 123', '123 Nguyễn Khánh Toàn, Cầu Giấy, Hà Nội', '0901111023', 'Cơm bình dân ngon, rẻ, nhanh', '15-20 phút', 5000, 4.4, 840, false),
('Cháo Lươn Nghệ An', '42 Nguyễn Xiển, Thanh Xuân, Hà Nội', '0901111026', 'Cháo lươn thơm, béo, cay nhẹ', '20-30 phút', 8000, 4.4, 880, false),
('Bánh Đa Cua Hải Phòng', '29 Nguyễn Phong Sắc, Cầu Giấy, Hà Nội', '0901111027', 'Bánh đa cua đậm chất đất Cảng', '25-30 phút', 10000, 4.5, 810, false),
('Cơm Tấm Sài Gòn 24h', '24 Hoàng Đạo Thúy, Thanh Xuân, Hà Nội', '0901111030', 'Cơm tấm ngon, phục vụ cả ngày', '15-25 phút', 7000, 4.7, 1080, true);


------------------------------------------------------------ 27/8/2025 ------------------------------------------------------------
-- bơm thêm 2 cột sau, phí giao hàng (fee) và trạng thái thanh toán (payment_status)
-- mặc định phí giao hàng là 0, trạng thái thanh toán là 'pending' (đang chờ thanh toán)
-- tương tự, thêm cột updated_at để theo dõi thời gian cập nhật đơn hàng. mặc định thời gian là thời gian hiện tại khi tạo đơn hàng
ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN payment_status VARCHAR(30) DEFAULT 'pending'; 

ALTER TABLE orders
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;