-- Create Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT, -- Can be UUID if your users table uses UUIDs, but keeping TEXT for flexibility with Auth providers
    user_name TEXT, -- Store name for easier display without joins
    action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', etc.
    entity_type TEXT NOT NULL, -- 'DEAL', 'AGENT', 'BUYER', 'NOTE', etc.
    entity_id TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster querying of recent activities
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable Row Level Security (RLS) - Optional, depending on your security model
-- ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all logs (or restrict as needed)
-- CREATE POLICY "Allow read access for all users" ON activity_logs FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert logs
-- CREATE POLICY "Allow insert access for all users" ON activity_logs FOR INSERT WITH CHECK (true);
