-- Create the activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    user_name TEXT,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_display TEXT,
    description TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type_id ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read all activity logs (or restrict to their own/company if needed)
CREATE POLICY "Allow authenticated users to read activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own activity logs
CREATE POLICY "Allow authenticated users to insert activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Note: Typically, activity logs should not be updated or deleted to maintain an audit trail.
-- If you need to allow deletion (e.g., for data retention policies), add a delete policy.

-- Set up realtime
alter publication supabase_realtime add table public.activity_logs;
