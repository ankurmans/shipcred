-- ============================================================
-- UPLOADED FILES (skill files, agent configs)
-- ============================================================

CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  file_type TEXT NOT NULL,                -- 'claude_md' | 'cursorrules' | 'mcp_config' | 'skill_file'
  file_name TEXT NOT NULL,
  content_hash TEXT NOT NULL,             -- SHA-256 of file content (for dedup)
  file_size INTEGER NOT NULL,
  line_count INTEGER NOT NULL,

  -- Parsing results
  is_parsed_valid BOOLEAN DEFAULT false,
  structural_markers_found TEXT[] DEFAULT '{}',
  parsing_notes TEXT,

  -- Storage
  storage_url TEXT NOT NULL,              -- Supabase Storage URL
  loom_url TEXT,                          -- Optional walkthrough video

  -- Verification
  vouch_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(content_hash)                    -- Global uniqueness
);

CREATE INDEX idx_uploads_profile ON uploaded_files(profile_id);
CREATE INDEX idx_uploads_hash ON uploaded_files(content_hash);

-- ============================================================
-- IMPACT METRICS
-- ============================================================

CREATE TABLE impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE CASCADE,

  metric_text TEXT NOT NULL,              -- "Generates 500 leads/week"
  endorsement_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_metrics_profile ON impact_metrics(profile_id);

-- ============================================================
-- COMMUNITY FLAGS
-- ============================================================

CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),

  flag_type TEXT NOT NULL,                -- 'profile' | 'portfolio_item' | 'upload' | 'vouch' | 'video_proof' | 'content_proof' | 'certification'
  target_id UUID NOT NULL,               -- ID of the flagged entity
  target_profile_id UUID NOT NULL REFERENCES profiles(id),

  reason TEXT NOT NULL,                   -- 'fake_commits' | 'copied_file' | 'fake_vouch' | 'spam' | 'other'
  description TEXT,

  status TEXT DEFAULT 'pending',          -- 'pending' | 'reviewed_clear' | 'reviewed_removed'
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(reporter_id, flag_type, target_id)
);

CREATE INDEX idx_flags_target ON flags(target_profile_id, status);
CREATE INDEX idx_flags_pending ON flags(flag_type, target_id, status) WHERE status = 'pending';

-- ============================================================
-- SCORE HISTORY (for velocity limit tracking)
-- ============================================================

CREATE TABLE score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  previous_score INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_score_history_profile ON score_history(profile_id, recorded_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

-- Uploads: public read, owner write
CREATE POLICY "Uploads viewable by everyone" ON uploaded_files
  FOR SELECT USING (true);
CREATE POLICY "Users insert own uploads" ON uploaded_files
  FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own uploads" ON uploaded_files
  FOR DELETE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Impact metrics: public read, owner write
CREATE POLICY "Metrics viewable by everyone" ON impact_metrics
  FOR SELECT USING (true);
CREATE POLICY "Users insert own metrics" ON impact_metrics
  FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own metrics" ON impact_metrics
  FOR DELETE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Flags: reporter can see own, create
CREATE POLICY "Flags viewable by reporter" ON flags
  FOR SELECT USING (reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can create flags" ON flags
  FOR INSERT WITH CHECK (reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Score history: owner only
CREATE POLICY "Users view own score history" ON score_history
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
