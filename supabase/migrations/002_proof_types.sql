-- ============================================================
-- VIDEO PROOFS
-- ============================================================

CREATE TABLE video_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  platform TEXT NOT NULL,                  -- 'loom' | 'youtube' | 'vimeo'
  title TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,

  -- Content categorization
  category TEXT,                           -- 'workflow_walkthrough' | 'tool_demo' | 'build_session'
  tools_mentioned TEXT[] DEFAULT '{}',     -- Auto-extracted from title/description
  description TEXT,                        -- User-provided context

  -- Verification
  url_verified BOOLEAN DEFAULT false,      -- URL resolves and is public
  vouch_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(profile_id, url)
);

CREATE INDEX idx_video_proofs_profile ON video_proofs(profile_id);

-- ============================================================
-- CONTENT PROOFS (blogs, threads, newsletters)
-- ============================================================

CREATE TABLE content_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  platform TEXT NOT NULL,                  -- 'blog' | 'twitter' | 'linkedin' | 'substack' | 'beehiiv' | 'medium' | 'github' | 'other'
  title TEXT,
  published_at TIMESTAMPTZ,

  -- Content analysis
  estimated_word_count INTEGER,
  tools_mentioned TEXT[] DEFAULT '{}',
  description TEXT,                        -- User-provided summary

  -- Verification
  url_verified BOOLEAN DEFAULT false,
  vouch_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(profile_id, url)
);

CREATE INDEX idx_content_proofs_profile ON content_proofs(profile_id);

-- ============================================================
-- CERTIFICATIONS
-- ============================================================

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  cert_name TEXT NOT NULL,
  issuer TEXT NOT NULL,                    -- 'openai' | 'clay' | 'hubspot' | 'gtm_ai_academy' | 'pma' | 'other'
  cert_url TEXT NOT NULL,                  -- Credly badge URL, cert page, etc.
  cert_id TEXT,                            -- Certificate ID if available
  issued_at TIMESTAMPTZ,

  -- Verification
  verification_status TEXT DEFAULT 'pending',  -- 'auto_verified' | 'vouch_verified' | 'pending'
  verification_method TEXT,                -- 'domain_match' | 'credly_api' | 'vouch' | null
  verified_at TIMESTAMPTZ,

  vouch_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(profile_id, cert_url)
);

CREATE INDEX idx_certs_profile ON certifications(profile_id);
CREATE INDEX idx_certs_issuer ON certifications(issuer);

-- ============================================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================================

ALTER TABLE video_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Video proofs: public read, owner write
CREATE POLICY "Video proofs viewable by everyone" ON video_proofs
  FOR SELECT USING (true);
CREATE POLICY "Users manage own video proofs" ON video_proofs
  FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users update own video proofs" ON video_proofs
  FOR UPDATE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own video proofs" ON video_proofs
  FOR DELETE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Content proofs: public read, owner write
CREATE POLICY "Content proofs viewable by everyone" ON content_proofs
  FOR SELECT USING (true);
CREATE POLICY "Users manage own content proofs" ON content_proofs
  FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users update own content proofs" ON content_proofs
  FOR UPDATE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own content proofs" ON content_proofs
  FOR DELETE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Certifications: public read, owner write
CREATE POLICY "Certifications viewable by everyone" ON certifications
  FOR SELECT USING (true);
CREATE POLICY "Users manage own certifications" ON certifications
  FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users update own certifications" ON certifications
  FOR UPDATE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own certifications" ON certifications
  FOR DELETE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
