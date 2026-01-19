-- ========================================
-- SUPPLIER PORTAL MIGRATION - FOOD DATABASE (RESTAURANTS)
-- Database: db-food-deli
-- Ngày tạo: 2026-01-17
-- Mục đích: Cập nhật bảng restaurants để link với owners
-- ========================================

-- QUAN TRỌNG: Chạy file này trên database db-food-deli
-- Kết nối: psql -U postgres -d db-food-deli

-- PREREQUISITES: Đã chạy 1_supplier_migration_users.sql trên db-shared-deli

-- ========================================
-- Backup và Clean Data
-- ========================================

-- Step 1: Backup dữ liệu cũ vào cột tạm
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS owner_id_old VARCHAR(50);

UPDATE restaurants 
SET owner_id_old = owner_id 
WHERE owner_id IS NOT NULL;

-- Step 2: Xóa dữ liệu cũ trong owner_id
UPDATE restaurants 
SET owner_id = NULL;

-- ========================================
-- Schema Changes
-- ========================================

-- Step 3: Sửa kiểu dữ liệu owner_id từ VARCHAR(50) sang INTEGER
ALTER TABLE restaurants 
ALTER COLUMN owner_id TYPE INTEGER USING owner_id::integer;

-- Step 4: Thêm comment cho cột owner_id
COMMENT ON COLUMN restaurants.owner_id IS 'Foreign key tới users.user_id trong db-shared-deli - chủ sở hữu nhà hàng';

-- Step 5: Tạo index để tối ưu query theo owner
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id 
ON restaurants(owner_id);

-- Step 6: Thêm cột verification_status cho partner registration (Phase 2)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'approved';

-- Step 7: Thêm cột documents để lưu thông tin giấy tờ (Phase 2)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS documents JSONB;

-- Step 8: Thêm constraints
COMMENT ON COLUMN restaurants.verification_status IS 'Trạng thái xác minh: pending, approved, rejected';
COMMENT ON COLUMN restaurants.documents IS 'Lưu trữ URLs và metadata của giấy tờ xác minh (business license, certificates, etc.)';

-- ========================================
-- VALIDATION
-- ========================================

-- Kiểm tra cấu trúc bảng
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'restaurants' 
    AND column_name IN ('owner_id', 'owner_id_old', 'verification_status', 'documents')
ORDER BY ordinal_position;

-- Kiểm tra index
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'restaurants' 
    AND indexname = 'idx_restaurants_owner_id';

-- Kiểm tra restaurants (owner_id sẽ NULL, owner_id_old có dữ liệu cũ)
SELECT 
    id,
    name,
    owner_id,
    owner_id_old,
    status,
    verification_status
FROM restaurants
ORDER BY id
LIMIT 10;

-- ========================================
-- ROLLBACK (nếu cần)
-- ========================================
-- UNCOMMENT để rollback:
-- UPDATE restaurants SET owner_id = owner_id_old WHERE owner_id_old IS NOT NULL;
-- ALTER TABLE restaurants ALTER COLUMN owner_id TYPE VARCHAR(50);
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS owner_id_old;
-- DROP INDEX IF EXISTS idx_restaurants_owner_id;
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS verification_status;
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS documents;