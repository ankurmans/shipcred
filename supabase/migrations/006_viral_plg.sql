-- ============================================================
-- 006: Viral PLG Engine
-- Adds referral tracking, profile views, milestones
-- ============================================================

-- Referral tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_digest_sent_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by) WHERE referred_by IS NOT NULL;

-- Profile view tracking
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_hash TEXT NOT NULL,
  viewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(profile_id, viewer_hash, viewed_at)
);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_id, viewed_at DESC);

-- Milestones
CREATE TABLE IF NOT EXISTS profile_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,      -- 'tier_upgrade' | 'score_milestone' | 'commit_count' | 'first_vouch'
  milestone_value TEXT,               -- 'builder' | '500' | '100' | etc.
  achieved_at TIMESTAMPTZ DEFAULT now(),
  seen_at TIMESTAMPTZ,
  shared_at TIMESTAMPTZ,
  UNIQUE(profile_id, milestone_type, milestone_value)
);
CREATE INDEX IF NOT EXISTS idx_milestones_profile ON profile_milestones(profile_id, achieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_milestones_unseen ON profile_milestones(profile_id) WHERE seen_at IS NULL;

-- RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile views insert by anyone" ON profile_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Profile views read by owner" ON profile_views
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Milestones viewable by owner" ON profile_milestones
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Milestones insertable by system" ON profile_milestones
  FOR INSERT WITH CHECK (true);
