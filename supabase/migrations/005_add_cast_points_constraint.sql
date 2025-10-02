-- Add unique constraint for CAST points
-- This ensures users can only get points once for casting
-- Add CAST to the existing unique constraint for single-use point types

-- Drop the existing constraint
DROP INDEX IF EXISTS points_user_source_unique;

-- Recreate the constraint with CAST included
CREATE UNIQUE INDEX IF NOT EXISTS points_user_source_unique 
ON points (user_id, source) 
WHERE source IN ('follow', 'channel_join', 'wallet_confirmation', 'app_add', 'cast');

-- Update the comment to include CAST
COMMENT ON INDEX points_user_source_unique IS 'Prevents duplicate points for single-use actions (follow, channel_join, wallet_confirmation, app_add, cast) while allowing multiple referral_bonus records';
