-- Create chat rooms for all existing signals
INSERT INTO signalChat (signal_id)
SELECT signal_id FROM signals
ON CONFLICT DO NOTHING;

-- Add student (signal creator) to all chat rooms
INSERT INTO signalChatUsers (signalChatID, user_id, role, created_at)
SELECT sc.signalChatID, s.user_id, 'student', s.created_at
FROM signalChat sc
JOIN signals s ON sc.signal_id = s.signal_id
ON CONFLICT (signalChatID, user_id) DO NOTHING;
