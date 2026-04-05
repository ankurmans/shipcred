-- ============================================================
-- 008: Platform profile URLs (Clay, n8n, Lovable, etc.)
-- Stored as JSONB so new platforms don't need schema changes
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS platform_urls JSONB DEFAULT '{}';

-- Example shape:
-- {
--   "clay": "https://app.clay.com/workspaces/...",
--   "n8n": "https://n8n.io/workflows/...",
--   "lovable": "https://lovable.dev/projects/...",
--   "cursor": "https://cursor.com/...",
--   "replit": "https://replit.com/@...",
--   "vercel": "https://vercel.com/...",
--   "bolt": "https://bolt.new/..."
-- }
