-- ==============================================================
-- 20260318_supplier_client_fixes_rollback.sql
-- Rollback cho 20260318_supplier_client_fixes.sql
-- Phạm vi rollback:
-- 1) Khôi phục cột restaurants.documents
-- 2) Khôi phục bảng banners
-- Lưu ý: đồng bộ users/restaurants hiện được xử lý trong API, không nằm trong script này.
-- ==============================================================

BEGIN;

-- 1) Khôi phục cột documents (không phục hồi dữ liệu cũ)
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS documents JSONB;

-- 2) Khôi phục bảng banners (không phục hồi dữ liệu cũ)
CREATE TABLE IF NOT EXISTS banners (
	banner_id SERIAL PRIMARY KEY,
	title VARCHAR(200),
	subtitle VARCHAR(500),
	image_url VARCHAR(255) NOT NULL,
	link_url VARCHAR(255),
	is_active BOOLEAN DEFAULT true,
	sort_order INTEGER DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;

