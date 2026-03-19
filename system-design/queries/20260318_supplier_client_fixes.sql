-- ==============================================================
-- 20260318_supplier_client_fixes.sql
-- Mục tiêu:
-- 1) Xóa cột documents trong bảng restaurants
-- 2) Xóa bảng banners
-- Ghi chú: Đồng bộ dữ liệu users/restaurants được xử lý trực tiếp trong API.
-- ==============================================================

BEGIN;

-- 1) Xóa cột documents
ALTER TABLE restaurants
DROP COLUMN IF EXISTS documents;

-- 2) Xóa bảng banners
DROP TABLE IF EXISTS banners;

COMMIT;
