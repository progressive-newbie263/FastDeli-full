-- ==========================================
-- PERFORMANCE INDEXES FOR FASTDELI DATABASE
-- Created: 2025-12-02
-- Based on actual schema from food_deli_full.sql
-- ==========================================

-- Drop existing performance indexes if any (để tránh conflict)
DROP INDEX IF EXISTS idx_restaurants_is_active;
DROP INDEX IF EXISTS idx_restaurants_is_featured;
DROP INDEX IF EXISTS idx_restaurants_created_at;
DROP INDEX IF EXISTS idx_reviews_rating;
DROP INDEX IF EXISTS idx_reviews_restaurant_rating;
DROP INDEX IF EXISTS idx_foods_is_available;
DROP INDEX IF EXISTS idx_foods_primary_category;
DROP INDEX IF EXISTS idx_foods_secondary_category;
DROP INDEX IF EXISTS idx_foods_restaurant_available;
DROP INDEX IF EXISTS idx_foods_is_featured;
DROP INDEX IF EXISTS idx_food_categories_category_name;
DROP INDEX IF EXISTS idx_order_items_food_id;
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_banners_is_active;
DROP INDEX IF EXISTS idx_promotions_dates;
DROP INDEX IF EXISTS idx_promotions_active;

-- ==========================================
-- RESTAURANTS TABLE INDEXES
-- ==========================================

CREATE INDEX idx_restaurants_is_active 
ON restaurants(is_active) 
WHERE is_active = true;

CREATE INDEX idx_restaurants_is_featured 
ON restaurants(is_featured) 
WHERE is_featured = true;

CREATE INDEX idx_restaurants_created_at 
ON restaurants(created_at DESC);

-- ==========================================
-- REVIEWS TABLE INDEXES (QUAN TRỌNG NHẤT!)
-- ==========================================

CREATE INDEX idx_reviews_rating 
ON reviews(rating);

CREATE INDEX idx_reviews_restaurant_rating 
ON reviews(restaurant_id, rating);

-- ==========================================
-- FOODS TABLE INDEXES
-- ==========================================

CREATE INDEX idx_foods_is_available 
ON foods(is_available) 
WHERE is_available = true;

CREATE INDEX idx_foods_primary_category 
ON foods(primary_category_id) 
WHERE primary_category_id IS NOT NULL;

CREATE INDEX idx_foods_secondary_category 
ON foods(secondary_category_id) 
WHERE secondary_category_id IS NOT NULL;

CREATE INDEX idx_foods_restaurant_available 
ON foods(restaurant_id, is_available, primary_category_id);

CREATE INDEX idx_foods_is_featured 
ON foods(is_featured) 
WHERE is_featured = true;

-- ==========================================
-- FOOD_CATEGORIES TABLE INDEXES
-- ==========================================

CREATE INDEX idx_food_categories_category_name 
ON food_categories(category_name);

-- ==========================================
-- ORDER_ITEMS TABLE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_order_items_food_id 
ON order_items(food_id);

-- ==========================================
-- ORDERS TABLE INDEXES
-- ==========================================

CREATE INDEX idx_orders_created_at 
ON orders(created_at DESC);

-- ==========================================
-- BANNERS TABLE INDEXES
-- ==========================================

CREATE INDEX idx_banners_is_active 
ON banners(is_active, sort_order) 
WHERE is_active = true;

-- ==========================================
-- PROMOTIONS TABLE INDEXES
-- ==========================================

CREATE INDEX idx_promotions_dates 
ON promotions(start_date, end_date, is_active) 
WHERE is_active = true;

CREATE INDEX idx_promotions_active 
ON promotions(is_active, is_platform);

-- ==========================================
-- ANALYZE TABLES
-- ==========================================
ANALYZE restaurants;
ANALYZE reviews;
ANALYZE foods;
ANALYZE food_categories;
ANALYZE orders;
ANALYZE order_items;
ANALYZE banners;
ANALYZE promotions;

-- ==========================================
-- VERIFY NEW INDEXES (SIMPLIFIED & FIXED)
-- ==========================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_restaurants_%' OR
    indexname LIKE 'idx_reviews_%' OR
    indexname LIKE 'idx_foods_%' OR
    indexname LIKE 'idx_food_categories_%' OR
    indexname LIKE 'idx_order_items_%' OR
    indexname LIKE 'idx_orders_created%' OR
    indexname LIKE 'idx_banners_%' OR
    indexname LIKE 'idx_promotions_%'
  )
ORDER BY tablename, indexname;

-- ==========================================
-- SUMMARY
-- ==========================================
SELECT 
    'Performance indexes created successfully!' as status,
    COUNT(*) as total_new_indexes
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_restaurants_%' OR
    indexname LIKE 'idx_reviews_%' OR
    indexname LIKE 'idx_foods_%' OR
    indexname LIKE 'idx_food_categories_%' OR
    indexname LIKE 'idx_order_items_food%' OR
    indexname LIKE 'idx_orders_created%' OR
    indexname LIKE 'idx_banners_%' OR
    indexname LIKE 'idx_promotions_%'
  );