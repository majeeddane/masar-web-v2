-- DIAGNOSE MESSAGING INTEGRITY
-- 1. Check for Orphan Messages (Messages with no Conversation row)
SELECT 
    count(*) as orphan_count 
FROM public.messages m 
LEFT JOIN public.conversations c ON c.id = m.conversation_id 
WHERE c.id IS NULL;

-- 2. Top 20 Orphaned Conversations (by message count)
SELECT 
    m.conversation_id, 
    count(*) as msg_count 
FROM public.messages m 
LEFT JOIN public.conversations c ON c.id = m.conversation_id 
WHERE c.id IS NULL 
GROUP BY m.conversation_id 
ORDER BY msg_count DESC 
LIMIT 20;

-- 3. Top 10 Active Conversations (Conversation exists check)
SELECT 
    m.conversation_id, 
    count(*) as msg_count, 
    (c.id IS NOT NULL) as has_conversation_row 
FROM public.messages m 
LEFT JOIN public.conversations c ON c.id = m.conversation_id 
GROUP BY m.conversation_id, c.id 
ORDER BY msg_count DESC 
LIMIT 10;

-- 4. LIST EXISTING POLICIES
SELECT * FROM pg_policies WHERE tablename IN ('conversations', 'messages');

-- =========================================================
-- OPTIONAL FIX SCRIPTS (Run only if needed)
-- =========================================================

-- A. CREATE MISSING CONVERSATIONS (Temporary Fix for Orphans)
/*
INSERT INTO public.conversations(id, user1_id, user2_id, created_at)
SELECT DISTINCT m.conversation_id, m.sender_id, m.sender_id, now()
FROM public.messages m
LEFT JOIN public.conversations c ON c.id = m.conversation_id
WHERE c.id IS NULL;
*/

-- B. ENSURE RLS POLICIES (Safe apply)
/*
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations: Read (Participants)
DROP POLICY IF EXISTS "read_own_conversations_v3" ON public.conversations;
CREATE POLICY "read_own_conversations_v3"
ON public.conversations FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages: Read (Participants)
DROP POLICY IF EXISTS "read_messages_in_own_conversations_v3" ON public.messages;
CREATE POLICY "read_messages_in_own_conversations_v3"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
      AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

-- Messages: Insert (Participants)
DROP POLICY IF EXISTS "send_messages_in_own_conversations_v3" ON public.messages;
CREATE POLICY "send_messages_in_own_conversations_v3"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
      AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

-- Messages: Update (Participants)
DROP POLICY IF EXISTS "update_messages_in_own_conversations_v3" ON public.messages;
CREATE POLICY "update_messages_in_own_conversations_v3"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
      AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);
*/
