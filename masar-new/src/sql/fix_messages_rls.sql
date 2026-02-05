-- Enable RLS on tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1. Conversation Policies
-- Allow users to see conversations they are part of
DROP POLICY IF EXISTS "read own conversations" ON public.conversations;
CREATE POLICY "read own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- 2. Message Policies
-- Allow users to see messages in conversations they are part of
DROP POLICY IF EXISTS "read messages in own conversations" ON public.messages;
CREATE POLICY "read messages in own conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

-- Allow users to insert messages into conversations they are part of
DROP POLICY IF EXISTS "send messages in own conversations" ON public.messages;
CREATE POLICY "send messages in own conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

-- Verification Query (Uncomment and replace UUID to test)
-- SELECT count(*) FROM public.messages WHERE conversation_id = 'YOUR_CONVERSATION_UUID_HERE';
