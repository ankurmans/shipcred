-- ============================================================
-- 007: Gamification — Streaks + Challenges
-- ============================================================

-- Streak tracking on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_week TEXT;

-- Challenge system
CREATE TABLE IF NOT EXISTS profile_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',        -- 'active' | 'completed' | 'expired'
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  UNIQUE(profile_id, challenge_id)
);
CREATE INDEX IF NOT EXISTS idx_challenges_profile ON profile_challenges(profile_id, status);

ALTER TABLE profile_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own challenges" ON profile_challenges
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Challenges insertable by system" ON profile_challenges
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Challenges updatable by system" ON profile_challenges
  FOR UPDATE USING (true);
