-- Rename score columns to match rebranded codebase
ALTER TABLE profiles RENAME COLUMN shipcred_score TO gtmcommit_score;
ALTER TABLE profiles RENAME COLUMN shipcred_tier TO gtmcommit_tier;
