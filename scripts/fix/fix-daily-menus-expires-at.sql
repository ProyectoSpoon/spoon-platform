-- Fix daily_menus.expires_at to expire at 22:00 Bogota on the SAME menu_date
-- Safe and idempotent: only updates rows where the value differs

-- 1) Backfill expires_at to menu_date 22:00 America/Bogota (stored as UTC)
UPDATE public.daily_menus m
SET expires_at = (m.menu_date::date + time '22:00') AT TIME ZONE 'America/Bogota'
WHERE expires_at IS DISTINCT FROM ((m.menu_date::date + time '22:00') AT TIME ZONE 'America/Bogota');

-- 2) Optional: strengthen constraint to ensure expires_at is on the same wall day at 22:00
-- Commented out to avoid breaking existing migrations; enable if desired.
-- ALTER TABLE public.daily_menus
--   DROP CONSTRAINT IF EXISTS daily_menus_expires_same_day_chk;
-- ALTER TABLE public.daily_menus
--   ADD CONSTRAINT daily_menus_expires_same_day_chk
--   CHECK (
--     expires_at = (menu_date::date + time '22:00') AT TIME ZONE 'America/Bogota'
--   );

-- 3) Verify
SELECT id, restaurant_id, menu_date,
       expires_at,
       (expires_at AT TIME ZONE 'America/Bogota') AS expires_at_bogota
FROM public.daily_menus
ORDER BY menu_date DESC
LIMIT 50;
