-- 1. Create Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES auth.users(id),
    user2_id UUID NOT NULL REFERENCES auth.users(id),
    job_id UUID REFERENCES jobs(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id, job_id)
);

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Conversations Policies
-- User can view conversations they are part of
CREATE POLICY "Users can view their conversations" 
ON conversations FOR SELECT 
TO public 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- User can create conversation if they are user1 (initiator)
CREATE POLICY "Users can start conversations" 
ON conversations FOR INSERT 
TO public 
WITH CHECK (auth.uid() = user1_id);

-- 5. Messages Policies
-- User can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" 
ON messages FOR SELECT 
TO public 
USING (
    EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = conversation_id 
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
);

-- User can insert messages if they are the sender AND part of the conversation
CREATE POLICY "Users can send messages in their conversations" 
ON messages FOR INSERT 
TO public 
WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = conversation_id 
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
);

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
