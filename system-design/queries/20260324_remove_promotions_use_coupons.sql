-- ============================================================
-- MIGRATION: Remove promotions tables and unify discount flow to coupons
-- Date: 2026-03-24
-- ============================================================
-- IMPORTANT:
-- 1) Backup DB before running.
-- 2) Run in a transaction and verify row counts before COMMIT.
-- 3) This script assumes table coupons has column restaurant_id.
-- ============================================================

BEGIN;

DROP TABLE IF EXISTS promotion_restaurants;
DROP TABLE IF EXISTS promotions;

COMMIT;

-- ============================================================
-- Rollback hint (manual):
-- Restore from backup if needed.
-- ============================================================
