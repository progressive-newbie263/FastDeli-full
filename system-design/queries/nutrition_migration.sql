-- ===========================================
-- MIGRATION: Add Nutrition Info for Foods (SIMPLE VERSION)
-- Date: 2026-03-09
-- Description: Minimal nutrition table - chỉ 4 trường chính
-- ===========================================

-- Thêm bảng food_nutrition với thông tin tối giản
CREATE TABLE IF NOT EXISTS food_nutrition (
  nutrition_id SERIAL PRIMARY KEY,
  food_id INTEGER NOT NULL REFERENCES foods(food_id) ON DELETE CASCADE,
  
  -- Chỉ 4 thông tin chính + serving size
  serving_size VARCHAR(100) DEFAULT '100g',  -- "100g", "1 suất", "1 tô"
  calories DECIMAL(8, 2),                     -- kcal
  protein DECIMAL(8, 2),                      -- gram (g)
  fat DECIMAL(8, 2),                          -- gram (g)
  sugar DECIMAL(8, 2),                        -- gram (g)
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Đảm bảo mỗi món chỉ có 1 bản ghi nutrition
  UNIQUE(food_id)
);

-- Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_food_nutrition_food_id ON food_nutrition(food_id);

-- Trigger tự động update updated_at
CREATE OR REPLACE FUNCTION update_nutrition_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_nutrition_timestamp ON food_nutrition;
CREATE TRIGGER trigger_update_nutrition_timestamp
BEFORE UPDATE ON food_nutrition
FOR EACH ROW
EXECUTE FUNCTION update_nutrition_timestamp();

-- Comment cho các cột
COMMENT ON TABLE food_nutrition IS 'Thông tin dinh dưỡng cơ bản cho món ăn (version đơn giản)';
COMMENT ON COLUMN food_nutrition.serving_size IS 'Kích thước phần ăn (e.g., "100g", "1 suất", "1 tô")';
COMMENT ON COLUMN food_nutrition.calories IS 'Calories - Năng lượng (kcal)';
COMMENT ON COLUMN food_nutrition.protein IS 'Protein - Chất đạm (g)';
COMMENT ON COLUMN food_nutrition.fat IS 'Fat - Chất béo (g)';
COMMENT ON COLUMN food_nutrition.sugar IS 'Sugar - Đường (g)';

-- Thêm một số data mẫu (optional)
-- INSERT INTO food_nutrition (food_id, serving_size, calories, protein, fat, sugar)
-- VALUES 
-- (1, '1 suất (300g)', 480, 30, 10.8, 2)
-- ON CONFLICT (food_id) DO NOTHING;


-- ===========================================
-- ROLLBACK SCRIPT
-- ===========================================
-- Nếu muốn quay lại trạng thái trước đó (xóa bảng nutrition),
-- chạy các lệnh sau:

/*

-- 1. Xóa trigger trước
DROP TRIGGER IF EXISTS trigger_update_nutrition_timestamp ON food_nutrition;

-- 2. Xóa function
DROP FUNCTION IF EXISTS update_nutrition_timestamp();

-- 3. Xóa index
DROP INDEX IF EXISTS idx_food_nutrition_food_id;

-- 4. Xóa bảng food_nutrition (CASCADE sẽ xóa tất cả foreign keys)
DROP TABLE IF EXISTS food_nutrition CASCADE;

-- 5. Verify đã xóa thành công
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'food_nutrition';
-- Kết quả phải trả về 0 rows

*/
