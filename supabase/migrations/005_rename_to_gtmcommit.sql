-- Rename score columns to match rebranded codebase
ALTER TABLE profiles RENAME COLUMN shipcred_score TO gtmcommit_score;
ALTER TABLE profiles RENAME COLUMN shipcred_tier TO gtmcommit_tier;

-- Rename indexes to match
ALTER INDEX IF EXISTS idx_profiles_score RENAME TO idx_profiles_gtmcommit_score;
ALTER INDEX IF EXISTS idx_profiles_tier RENAME TO idx_profiles_gtmcommit_tier;
