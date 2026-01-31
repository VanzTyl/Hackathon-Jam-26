-- Create Signal Chat Table
CREATE TABLE IF NOT EXISTS signalChat (
  signalChatID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_id UUID NOT NULL REFERENCES signals(signal_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Signal Chat Users Table
CREATE TABLE IF NOT EXISTS signalChatUsers (
  signalChatID UUID NOT NULL REFERENCES signalChat(signalChatID),
  user_id UUID NOT NULL REFERENCES users(user_id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'mentor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (signalChatID, user_id)
);

-- Create Signal Messages Table
CREATE TABLE IF NOT EXISTS signalMessages (
  message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signalChatID UUID NOT NULL REFERENCES signalChat(signalChatID),
  sender_id UUID NOT NULL REFERENCES users(user_id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_signalChat_signal_id ON signalChat(signal_id);
CREATE INDEX IF NOT EXISTS idx_signalChatUsers_signalChatID ON signalChatUsers(signalChatID);
CREATE INDEX IF NOT EXISTS idx_signalChatUsers_user_id ON signalChatUsers(user_id);
CREATE INDEX IF NOT EXISTS idx_signalMessages_signalChatID ON signalMessages(signalChatID);
CREATE INDEX IF NOT EXISTS idx_signalMessages_created_at ON signalMessages(created_at);

-- DISABLE ROW LEVEL SECURITY for easy prototyping
ALTER TABLE signalChat DISABLE ROW LEVEL SECURITY;
ALTER TABLE signalChatUsers DISABLE ROW LEVEL SECURITY;
ALTER TABLE signalMessages DISABLE ROW LEVEL SECURITY;
