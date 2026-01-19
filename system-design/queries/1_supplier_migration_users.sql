-- ========================================
-- SUPPLIER PORTAL MIGRATION - SHARED DATABASE (USERS)
-- Database: db-shared-deli
-- Ngày tạo: 2026-01-15
-- Mục đích: Tạo users với role restaurant_owner
-- ========================================

-- QUAN TRỌNG: Chạy file này trên database db-shared-deli
-- Kết nối: psql -U postgres -d db-shared-deli

-- ========================================
-- Tạo Restaurant Owner Users
-- ========================================

-- LƯU Ý: Thay các password hash bằng kết quả từ bcrypt
-- Chạy: node server/auth-service/generate-supplier-passwords.js
-- Hoặc dùng: https://bcrypt-generator.com/ với input "supplier123" và rounds 10

INSERT INTO users (phone_number, email, password_hash, full_name, avatar_url, date_of_birth, gender, role, created_at, updated_at)
VALUES 
    ('0901234567', 'supplier@fastdeli.com', '$2b$10$TfqeRJX/nTrwpqRRtZZNs.mt7Ln0mxM5lz0vrk1wBrG1ztXekCM8q', 'Nhà hàng Demo', 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg', '2001-01-01', 'male', 'restaurant_owner', NOW(), NOW()),
    ('0901234568', 'supplier2@fastdeli.com', '$2b$10$6W1cQNY1Lou6VG/yirAtceqZusA0iVKd2OawKhefNYMy3ls5fOnNS', 'Phở Hà Nội', 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg', '2002-02-02', 'female', 'restaurant_owner', NOW(), NOW()),
    ('0901234569', 'supplier3@fastdeli.com', '$2b$10$bfhUNRAZHoiSuE.Piz2XKOyNaqvHwYHgrD1xUuYac0brQqPgd2v8m', 'Bún Chả Hương Liên', 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg', '2003-03-03', 'male', 'restaurant_owner', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- VALIDATION
-- ========================================

-- Kiểm tra users vừa tạo
SELECT user_id, email, full_name, role, created_at
FROM users 
WHERE role = 'restaurant_owner'
ORDER BY user_id;

-- Đếm số lượng users theo role
SELECT role, COUNT(*) as total
FROM users
GROUP BY role
ORDER BY role;

-- ========================================
-- NOTES
-- ========================================
-- Sau khi chạy file này thành công:
-- 1. Note lại các user_id được tạo
-- 2. Chạy file 2_supplier_migration_restaurants.sql trên db-food-deli
-- 3. Link restaurants với owners sử dụng user_id vừa note

-- ========================================
-- ROLLBACK (nếu cần)
-- ========================================
-- UNCOMMENT để rollback:
-- DELETE FROM users WHERE role = 'restaurant_owner' AND email LIKE '%@fastdeli.com';
