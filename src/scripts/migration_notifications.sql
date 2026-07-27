
-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only see their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Only system (or service role) can insert, but for now we might allow users to trigger them for testing?
-- Let's stick to service role for inserts mostly, but if we have client-side logic...
-- Actually, let's allow users to insert notifications for themselves (e.g. 'Welcome').
CREATE POLICY "Users can insert their own notifications" 
ON notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);
