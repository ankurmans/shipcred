-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  role TEXT,
  company TEXT,
  looking_for_work BOOLEAN DEFAULT false,
  github_username TEXT,
  github_access_token TEXT,
  github_connected_at TIMESTAMPTZ,
  github_scopes TEXT[],
  last_github_sync_at TIMESTAMPTZ,
  shipcred_score INTEGER DEFAULT 0,
  shipcred_tier TEXT DEFAULT 'unranked',
  score_breakdown JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  profile_completeness INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_profiles_user ON profiles(user_id);
CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_score ON profiles(shipcred_score DESC);
CREATE INDEX idx_profiles_tier ON profiles(shipcred_tier);
CREATE INDEX idx_profiles_featured ON profiles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_profiles_github ON profiles(github_username) WHERE github_username IS NOT NULL;

-- ============================================================
-- GITHUB COMMIT DATA
-- ============================================================

CREATE TABLE github_commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  repo_full_name TEXT NOT NULL,
  repo_is_private BOOLEAN DEFAULT false,
  commit_message TEXT,
  committed_at TIMESTAMPTZ NOT NULL,
  ai_tool_detected TEXT,
  ai_detection_method TEXT,
  ai_detection_confidence REAL DEFAULT 0,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_commits_sha ON github_commits(commit_sha, profile_id);
CREATE INDEX idx_commits_profile ON github_commits(profile_id, committed_at DESC);
CREATE INDEX idx_commits_ai_tool ON github_commits(ai_tool_detected) WHERE ai_tool_detected IS NOT NULL;
CREATE INDEX idx_commits_date ON github_commits(committed_at DESC);

-- ============================================================
-- PORTFOLIO ITEMS
-- ============================================================

CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  screenshot_url TEXT,
  category TEXT,
  tools_used TEXT[] DEFAULT '{}',
  verification_status TEXT DEFAULT 'self_reported',
  vouch_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portfolio_profile ON portfolio_items(profile_id, display_order);

-- ============================================================
-- TOOL DECLARATIONS
-- ============================================================

CREATE TABLE tool_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  proficiency TEXT DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  verified_commit_count INTEGER DEFAULT 0,
  declared_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, tool_name)
);

CREATE INDEX idx_tools_profile ON tool_declarations(profile_id);
CREATE INDEX idx_tools_name ON tool_declarations(tool_name);

-- ============================================================
-- VOUCHES
-- ============================================================

CREATE TABLE vouches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vouchee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(voucher_id, vouchee_id),
  CHECK(voucher_id != vouchee_id)
);

CREATE INDEX idx_vouches_vouchee ON vouches(vouchee_id);
CREATE INDEX idx_vouches_voucher ON vouches(voucher_id);

-- ============================================================
-- GITHUB SYNC JOBS
-- ============================================================

CREATE TABLE github_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  repos_scanned INTEGER DEFAULT 0,
  commits_analyzed INTEGER DEFAULT 0,
  ai_commits_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sync_jobs_profile ON github_sync_jobs(profile_id, created_at DESC);

-- ============================================================
-- EXTERNAL PROOF SOURCES
-- ============================================================

CREATE TABLE external_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  project_url TEXT NOT NULL,
  project_name TEXT,
  platform_data JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'pending',
  verification_method TEXT,
  verified_at TIMESTAMPTZ,
  screenshot_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  proof_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, source_type, project_url)
);

CREATE INDEX idx_external_proofs_profile ON external_proofs(profile_id, display_order);
CREATE INDEX idx_external_proofs_source ON external_proofs(source_type);
CREATE INDEX idx_external_proofs_verified ON external_proofs(verification_status) WHERE verification_status = 'verified';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_proofs ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- GitHub commits: owner only
CREATE POLICY "Users can view own commits" ON github_commits
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Portfolio items: public read, owner write
CREATE POLICY "Portfolio items are viewable by everyone" ON portfolio_items
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own portfolio" ON portfolio_items
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Tool declarations: public read, owner write
CREATE POLICY "Tool declarations are viewable by everyone" ON tool_declarations
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own tools" ON tool_declarations
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Vouches: public read, voucher can create/delete
CREATE POLICY "Vouches are viewable by everyone" ON vouches
  FOR SELECT USING (true);
CREATE POLICY "Users can create vouches" ON vouches
  FOR INSERT WITH CHECK (voucher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own vouches" ON vouches
  FOR DELETE USING (voucher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Sync jobs: owner only
CREATE POLICY "Users can view own sync jobs" ON github_sync_jobs
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- External proofs: public read, owner write
CREATE POLICY "External proofs are viewable by everyone" ON external_proofs
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own external proofs" ON external_proofs
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER portfolio_items_updated_at BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER external_proofs_updated_at BEFORE UPDATE ON external_proofs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_vouch_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.portfolio_item_id IS NOT NULL THEN
    UPDATE portfolio_items SET vouch_count = vouch_count + 1 WHERE id = NEW.portfolio_item_id;
  ELSIF TG_OP = 'DELETE' AND OLD.portfolio_item_id IS NOT NULL THEN
    UPDATE portfolio_items SET vouch_count = vouch_count - 1 WHERE id = OLD.portfolio_item_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vouches_count_trigger AFTER INSERT OR DELETE ON vouches
  FOR EACH ROW EXECUTE FUNCTION update_vouch_count();
