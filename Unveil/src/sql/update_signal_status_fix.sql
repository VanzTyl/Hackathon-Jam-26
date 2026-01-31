-- Update signal status values
-- New statuses: 'open', 'waiting_for_approval', 'helping', 'closed'
-- This migration assumes the column already exists (from previous schema)

-- Drop existing constraint if it exists
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_status_check;

-- Add the new constraint with all status values
ALTER TABLE signals ADD CONSTRAINT signals_status_check CHECK (status IN ('open', 'waiting_for_approval', 'helping', 'closed'));

-- Note: We use 'helping' instead of 'helping' because 'helping' might be a reserved keyword in PostgreSQL
