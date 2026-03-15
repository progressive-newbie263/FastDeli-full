-- ===========================================
-- VERIFY NUTRITION MIGRATION
-- Kiểm tra xem migration đã chạy thành công chưa
-- ===========================================

-- 1. Kiểm tra bảng food_nutrition có tồn tại không
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'food_nutrition'
        ) 
        THEN 'Bảng food_nutrition: TỒN TẠI'
        ELSE 'Bảng food_nutrition: KHÔNG TỒN TẠI'
    END AS table_status;

-- 2. Kiểm tra cấu trúc bảng
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'food_nutrition'
ORDER BY ordinal_position;

-- 3. Kiểm tra function có tồn tại không
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'update_nutrition_timestamp'
        ) 
        THEN 'Function update_nutrition_timestamp(): TỒN TẠI'
        ELSE 'Function update_nutrition_timestamp(): KHÔNG TỒN TẠI'
    END AS function_status;

-- 4. Kiểm tra trigger có tồn tại không
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'trigger_update_nutrition_timestamp'
        ) 
        THEN 'Trigger trigger_update_nutrition_timestamp: TỒN TẠI'
        ELSE 'Trigger trigger_update_nutrition_timestamp: KHÔNG TỒN TẠI'
    END AS trigger_status;

-- 5. Kiểm tra index có tồn tại không
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'idx_food_nutrition_food_id'
        ) 
        THEN 'Index idx_food_nutrition_food_id: TỒN TẠI'
        ELSE 'Index idx_food_nutrition_food_id: KHÔNG TỒN TẠI'
    END AS index_status;

-- 6. Kiểm tra UNIQUE constraint trên food_id
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'food_nutrition'::regclass
ORDER BY conname;

-- 7. Test insert dữ liệu mẫu (optional - comment out nếu không muốn test)
/*
INSERT INTO food_nutrition (food_id, serving_size, calories, protein, carbohydrates, fat, fiber, sugar, sodium)
VALUES (999, '1 suất (300g)', 480, 30, 60, 10.8, 1.2, 0, 0)
ON CONFLICT (food_id) DO UPDATE 
SET calories = EXCLUDED.calories;

SELECT * FROM food_nutrition WHERE food_id = 999;

-- Xóa data test
DELETE FROM food_nutrition WHERE food_id = 999;
*/

-- 8. Kết quả tổng hợp
SELECT 
    'MIGRATION HOÀN TẤT' AS summary,
    'Nếu tất cả status đều ✅ thì migration thành công!' AS note;
