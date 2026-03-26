-- 2026-03-26
-- Add restaurant-scoped coupon support.
-- Safe to run multiple times.

BEGIN;

ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS restaurant_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_coupons_restaurant_id
  ON coupons (restaurant_id);

-- Optional FK (uncomment when restaurants.id exists and data is clean)
-- ALTER TABLE coupons
--   ADD CONSTRAINT coupons_restaurant_id_fkey
--   FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
--   ON DELETE CASCADE;

COMMIT;
