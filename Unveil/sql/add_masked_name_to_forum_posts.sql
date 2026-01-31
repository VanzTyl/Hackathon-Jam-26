-- Add masked_name column to forum_posts table
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS masked_name VARCHAR(100);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_masked_name ON forum_posts(masked_name);
