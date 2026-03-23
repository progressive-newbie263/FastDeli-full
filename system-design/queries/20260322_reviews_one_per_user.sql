-- Reset reviews to a new clean model:
-- - No order_id
-- - One review per (user_id, restaurant_id)
-- - Existing reviews are discarded

BEGIN;

DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_reviews_user_restaurant UNIQUE (user_id, restaurant_id),
  CONSTRAINT reviews_restaurant_id_fkey
    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Since reviews are recreated empty, reset restaurant aggregates.
UPDATE restaurants
SET
  rating = 0,
  total_reviews = 0,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;
