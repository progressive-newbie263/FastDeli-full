-- ========================================
-- SUPPLIER PORTAL MIGRATION
-- Ngày tạo: 2026-01-15
-- Mục đích: Thêm linkage giữa restaurants và owners, hỗ trợ supplier portal
-- ========================================

-- Step 1: Thêm cột owner_id vào bảng restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS owner_id INTEGER;

-- Step 2: Thêm comment cho cột mới
COMMENT ON COLUMN restaurants.owner_id IS 'Foreign key tới users.user_id - chủ sở hữu nhà hàng';

-- Step 3: Tạo index để tối ưu query theo owner
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id 
ON restaurants(owner_id);

-- Step 4: Thêm cột verification status cho partner registration (Phase 2)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'approved';

-- Step 5: Thêm cột documents để lưu thông tin giấy tờ (Phase 2)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS documents JSONB;

-- Step 6: Thêm comment
COMMENT ON COLUMN restaurants.verification_status IS 'Trạng thái xác minh: pending, approved, rejected';
COMMENT ON COLUMN restaurants.documents IS 'Lưu trữ URLs và metadata của giấy tờ xác minh (business license, certificates, etc.)';

-- ========================================
-- DATA MIGRATION: Gắn nhà hàng hiện tại với owner demo
-- ========================================

-- Step 7: Tạo user demo cho restaurant owner (nếu chưa có)
-- Password: supplier123 (đã hash bằng bcrypt)
INSERT INTO users (phone_number, email, password_hash, full_name, role, created_at, updated_at)
VALUES 
    ('0901234567', 'supplier@fastdeli.com', '$2b$10$TfqeRJX/nTrwpqRRtZZNs.mt7Ln0mxM5lz0vrk1wBrG1ztXekCM8q', 'Nhà hàng Demo', 'restaurant_owner', NOW(), NOW()),
    ('0901234568', 'supplier2@fastdeli.com', '$2b$10$6W1cQNY1Lou6VG/yirAtceqZusA0iVKd2OawKhefNYMy3ls5fOnNS', 'Phở Hà Nội', 'restaurant_owner', NOW(), NOW()),
    ('0901234569', 'supplier3@fastdeli.com', '$2b$10$bfhUNRAZHoiSuE.Piz2XKOyNaqvHwYHgrD1xUuYac0brQqPgd2v8m', 'Bún Chả Hương Liên', 'restaurant_owner', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Step 8: Gắn restaurants hiện có với owners (ví dụ)
-- Cập nhật theo data thực tế của bạn
UPDATE restaurants 
SET owner_id = (SELECT user_id FROM users WHERE email = 'supplier@fastdeli.com' LIMIT 1)
WHERE id = 1 AND owner_id IS NULL;

UPDATE restaurants 
SET owner_id = (SELECT user_id FROM users WHERE email = 'supplier2@fastdeli.com' LIMIT 1)
WHERE id = 2 AND owner_id IS NULL;

UPDATE restaurants 
SET owner_id = (SELECT user_id FROM users WHERE email = 'supplier3@fastdeli.com' LIMIT 1)
WHERE id = 3 AND owner_id IS NULL;

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Kiểm tra cấu trúc mới
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'restaurants' 
    AND column_name IN ('owner_id', 'verification_status', 'documents')
ORDER BY ordinal_position;

-- Kiểm tra index
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'restaurants' 
    AND indexname = 'idx_restaurants_owner_id';

-- Kiểm tra data migration
SELECT 
    r.id,
    r.name,
    r.owner_id,
    u.full_name as owner_name,
    u.email as owner_email,
    r.verification_status
FROM restaurants r
LEFT JOIN users u ON r.owner_id = u.user_id
LIMIT 10;

-- ========================================
-- ROLLBACK SCRIPT (Nếu cần)
-- ========================================

-- UNCOMMENT ĐỂ ROLLBACK:
-- DROP INDEX IF EXISTS idx_restaurants_owner_id;
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS owner_id;
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS verification_status;
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS documents;
-- DELETE FROM users WHERE role = 'restaurant_owner' AND email LIKE '%@fastdeli.com';

-- ========================================
-- PASSWORD GENERATION HELPER
-- ========================================
-- Để generate password hash cho supplier123, chạy trong Node.js:
-- 
-- const bcrypt = require('bcrypt');
-- const password = 'supplier123';
-- bcrypt.hash(password, 10).then(hash => console.log(hash));
--
-- Hoặc sử dụng tool online: https://bcrypt-generator.com/
-- Input: supplier123
-- Rounds: 10
