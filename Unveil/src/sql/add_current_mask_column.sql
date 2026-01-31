-- Add current_mask column to users table to track which mask (student/mentor) the user is currently using
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_mask VARCHAR(10) DEFAULT 'student' CHECK (current_mask IN ('student', 'mentor'));
