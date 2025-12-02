-- Migration: add telegram fields to users
ALTER TABLE IF EXISTS "users"
  ADD COLUMN IF NOT EXISTS telegram_id TEXT;

-- add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_telegram_id_key'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT users_telegram_id_key UNIQUE (telegram_id);
  END IF;
END $$;

ALTER TABLE IF EXISTS "users"
  ADD COLUMN IF NOT EXISTS telegram_username TEXT;

ALTER TABLE IF EXISTS "users"
  ADD COLUMN IF NOT EXISTS telegram_photo TEXT;
