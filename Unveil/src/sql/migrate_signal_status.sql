-- Update signal status values step by step

-- Step 1: Update existing 'in_progress' to 'helping'
UPDATE signals
SET status = 'helping'
WHERE status = 'in_progress';

-- Step 2: Drop old constraint
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_status_check;

-- Step 3: Add new constraint with updated statuses
ALTER TABLE signals ADD CONSTRAINT signals_status_check CHECK (status IN ('open', 'waiting_for_approval', 'helping', 'closed'));
