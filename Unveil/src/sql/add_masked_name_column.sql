-- Add masked_name column to signals table
-- This preserves the masked_name that was used when the signal was created
ALTER TABLE signals ADD COLUMN IF NOT EXISTS masked_name VARCHAR(100);
