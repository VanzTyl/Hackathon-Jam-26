-- Update signal status values
-- New statuses: 'open', 'waiting_for_approval', 'helping', 'closed'
ALTER TABLE signals ALTER COLUMN status SET NOT NULL DEFAULT 'open';
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_status_check;
ALTER TABLE signals ADD CONSTRAINT signals_status_check CHECK (status IN ('open', 'waiting_for_approval', 'helping', 'closed'));
