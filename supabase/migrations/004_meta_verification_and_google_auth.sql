-- ============================================================
-- Add verification_code to external_proofs for meta tag ownership
-- ============================================================

ALTER TABLE external_proofs
  ADD COLUMN IF NOT EXISTS verification_code TEXT,
  ADD COLUMN IF NOT EXISTS ownership_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ownership_verified_at TIMESTAMPTZ;

-- Each proof gets a unique verification code for meta tag ownership
CREATE UNIQUE INDEX IF NOT EXISTS idx_proofs_verification_code
  ON external_proofs(verification_code) WHERE verification_code IS NOT NULL;

-- ============================================================
-- Update profiles for Google OAuth users (no GitHub required)
-- ============================================================

-- Make github_username nullable (already is, but ensure)
-- Add auth_provider to track how user signed up
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'github';

-- Username selection: flag for users who haven't chosen yet
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username_confirmed BOOLEAN DEFAULT true;
