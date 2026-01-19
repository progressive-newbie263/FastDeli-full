-- ========================================
-- SUPPLIER PORTAL MIGRATION - FOOD DATABASE (RESTAURANTS)
-- Database: db-food-deli
-- Ngày tạo: 2026-01-17
-- Mục đích: Link restaurants với owners (manual mapping)
-- ========================================

-- QUAN TRỌNG: Chạy file này trên database db-food-deli
-- Kết nối: psql -U postgres -d db-food-deli

-- PREREQUISITES:
-- 1) Đã chạy 1_supplier_migration_users.sql trên db-shared-deli
-- 2) Đã chạy 2_supplier_migration_restaurants.sql trên db-food-deli

-- GHI CHÚ:
-- Dữ liệu hiện tại là mock data nên KHÔNG có liên kết thật giữa users và restaurants.
-- Vì vậy cần mapping thủ công: chọn restaurant_id muốn gán cho user_id (13,14,15).

-- ========================================
-- BƯỚC 1: TẠO 3 NHÀ HÀNG MỚI (ID >= 29)
-- ========================================

-- Tạo 3 nhà hàng mới và gán owner_id trực tiếp
-- user_id đã có: 13, 14, 15

BEGIN;

INSERT INTO restaurants (
    id,
    name,
    address,
    phone,
    email,
    description,
    delivery_time_min,
    delivery_time_max,
    delivery_fee,
    min_order_value,
    opening_time,
    closing_time,
    status,
    owner_id
)
VALUES
    (29, 'Nhà hàng Demo 13', '29 Nguyễn Văn Cừ, Long Biên, Hà Nội', '0901111013', 'restaurant-29@fastdeli.com', 'Nhà hàng demo cho supplier 13', 20, 30, 15000, 0, '08:00:00', '22:00:00', 'active', 13),
    (30, 'Nhà hàng Demo 14', '30 Trần Duy Hưng, Cầu Giấy, Hà Nội', '0901111014', 'restaurant-30@fastdeli.com', 'Nhà hàng demo cho supplier 14', 25, 35, 12000, 0, '08:00:00', '22:00:00', 'active', 14),
    (31, 'Nhà hàng Demo 15', '31 Lê Văn Lương, Thanh Xuân, Hà Nội', '0901111015', 'restaurant-31@fastdeli.com', 'Nhà hàng demo cho supplier 15', 15, 25, 10000, 0, '08:00:00', '22:00:00', 'active', 15)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ========================================
-- VALIDATION
-- ========================================

-- Kiểm tra restaurants đã link thành công
SELECT 
    id,
    name,
    owner_id,
    owner_id_old,
    status,
    verification_status
FROM restaurants
WHERE owner_id IN (13, 14, 15)
ORDER BY id;

-- Kiểm tra thông tin chi tiết (cross-check với db-shared-deli)
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.owner_id,
    r.owner_id_old as old_owner_id,
    r.verification_status,
    r.status
FROM restaurants r
WHERE r.owner_id IS NOT NULL
ORDER BY r.id;

-- Đếm số lượng restaurants theo owner
SELECT 
    owner_id,
    COUNT(*) as restaurant_count
FROM restaurants
WHERE owner_id IS NOT NULL
GROUP BY owner_id
ORDER BY owner_id;

-- Hiển thị mapping để verify
SELECT 
    'Restaurant ID ' || id || ' (' || name || ') -> Owner ID ' || owner_id as mapping
FROM restaurants
WHERE owner_id IN (13, 14, 15)
ORDER BY id;

-- ========================================
-- ROLLBACK (nếu cần)
-- ========================================
-- BEGIN;
-- UPDATE restaurants SET owner_id = NULL WHERE owner_id IN (13, 14, 15);
-- COMMIT;