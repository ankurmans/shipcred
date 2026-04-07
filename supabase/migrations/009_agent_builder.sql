-- Add Agent Builder badge fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_agent_builder BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_builder_signals TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_profiles_agent_builder ON profiles(is_agent_builder) WHERE is_agent_builder = true;
