-- Create the sender_emails table
CREATE TABLE IF NOT EXISTS public.sender_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sender_emails_updated_at
    BEFORE UPDATE ON public.sender_emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert the default emails
INSERT INTO public.sender_emails (email, name, is_default) VALUES
    ('asharizakarrei@gmail.com', 'Ashari Zakar', true),
    ('ashari@asharizakargroup.com', 'Ashari Zakar', false),
    ('dispo@asharizakargroup.com', 'Dispositions', false),
    ('acquisitions@asharizakargroup.com', 'Acquisitions', false)
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.sender_emails ENABLE ROW LEVEL SECURITY;

-- Create policies (Adjust these based on your app's security needs)
-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" 
    ON public.sender_emails 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Allow insert/update/delete access to authenticated users (or restrict to admins)
CREATE POLICY "Allow all access to authenticated users" 
    ON public.sender_emails 
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);
