-- Add mentor assignment columns to signals table
-- Also update status values to: 'open', 'waiting_for_approval', 'helping', 'closed'
ALTER TABLE signals ADD COLUMN IF NOT EXISTS assigned_mentor_user_id UUID REFERENCES users(user_id);
ALTER TABLE signals ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE signals ALTER COLUMN status SET NOT NULL DEFAULT 'open';
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_status_check;
ALTER TABLE signals ADD CONSTRAINT signals_status_check CHECK (status IN ('open', 'waiting_for_approval', 'helping', 'closed'));
