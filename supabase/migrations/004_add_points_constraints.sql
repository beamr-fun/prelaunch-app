-- Add unique constraints to prevent duplicate point records for specific point types
-- This ensures users can only get points once for: follow, channel_join, wallet_confirmation, app_add
-- But allows multiple referral_bonus records

-- Create unique constraint for single-use point types
CREATE UNIQUE INDEX IF NOT EXISTS points_user_source_unique 
ON points (user_id, source) 
WHERE source IN ('follow', 'channel_join', 'wallet_confirmation', 'app_add');

-- Add index for better performance on point queries
CREATE INDEX IF NOT EXISTS points_user_id_created_at_idx 
ON points (user_id, created_at DESC);

-- Add index for source-based queries
CREATE INDEX IF NOT EXISTS points_source_idx 
ON points (source);

-- Add comment explaining the constraint
COMMENT ON INDEX points_user_source_unique IS 'Prevents duplicate points for single-use actions (follow, channel_join, wallet_confirmation, app_add) while allowing multiple referral_bonus records';
