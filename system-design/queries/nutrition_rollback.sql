-- ===========================================
-- ROLLBACK MIGRATION: Remove Nutrition Table
-- Date: 2026-03-08
-- Description: Revert nutrition migration to previous state
-- ===========================================

-- CẢNH BÁO: Script này sẽ XÓA VĨNH VIỄN:
-- - Bảng food_nutrition và TẤT CẢ dữ liệu trong đó
-- - Trigger update_nutrition_timestamp
-- - Function update_nutrition_timestamp()
-- - Index idx_food_nutrition_food_id

-- Uncomment dòng dưới để xác nhận bạn muốn rollback
-- SET client_min_messages TO WARNING;

BEGIN;

-- Bước 1: Xóa trigger
DROP TRIGGER IF EXISTS trigger_update_nutrition_timestamp ON food_nutrition;
SELECT 'Đã xóa trigger: trigger_update_nutrition_timestamp' AS status;

-- Bước 2: Xóa function
DROP FUNCTION IF EXISTS update_nutrition_timestamp();
SELECT 'Đã xóa function: update_nutrition_timestamp()' AS status;

-- Bước 3: Xóa index
DROP INDEX IF EXISTS idx_food_nutrition_food_id;
SELECT 'Đã xóa index: idx_food_nutrition_food_id' AS status;

-- Bước 4: Xóa bảng food_nutrition (CASCADE tự động xóa constraints)
DROP TABLE IF EXISTS food_nutrition CASCADE;
SELECT 'Đã xóa bảng: food_nutrition' AS status;

-- Bước 5: Verify đã xóa thành công
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'food_nutrition'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'ROLLBACK THÀNH CÔNG: Bảng food_nutrition đã được xóa hoàn toàn';
    ELSE
        RAISE EXCEPTION 'ROLLBACK THẤT BẠI: Bảng food_nutrition vẫn còn tồn tại';
    END IF;
END $$;

COMMIT;

-- Kết quả mong đợi:
-- Database đã quay về trạng thái trước khi có bảng nutrition
-- Không còn bất kỳ object nào liên quan đến food_nutrition

SELECT 'Database đã rollback về trạng thái trước migration nutrition' AS final_status;
