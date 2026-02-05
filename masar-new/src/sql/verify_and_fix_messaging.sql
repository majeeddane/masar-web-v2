-- 1. INSPECT SCHEMA
-- Always good to see what we are working with
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name IN ('conversations', 'messages')
ORDER BY table_name, ordinal_position;

-- 2. EXISTING POLICIES check
SELECT * FROM pg_policies WHERE tablename IN ('conversations', 'messages');

-- 3. GLOBAL STATS
SELECT 
  (SELECT count(*) FROM public.conversations) as total_conversations,
  (SELECT count(*) FROM public.messages) as total_messages;

-- 4. TOP 10 CONVERSATIONS BY MESSAGE COUNT
-- This helps identify active conversation IDs
SELECT conversation_id, count(*) as msg_count
FROM public.messages
GROUP BY conversation_id
ORDER BY msg_count DESC
LIMIT 10;

-- 5. DIAGNOSTICS: SMART TARGET SELECTION & DETAILS
-- Finds the most recent conversation that actually has messages.
WITH target_ref AS (
  SELECT conversation_id 
  FROM public.messages 
  ORDER BY created_at DESC 
  LIMIT 1
)
SELECT 
  'TARGET_INFO' as type,
  t.conversation_id,
  (SELECT count(*) FROM public.messages m WHERE m.conversation_id = t.conversation_id) as total_msgs_in_conv,
  (SELECT id FROM public.messages m WHERE m.conversation_id = t.conversation_id ORDER BY created_at DESC LIMIT 1) as last_msg_id,
  (SELECT created_at FROM public.messages m WHERE m.conversation_id = t.conversation_id ORDER BY created_at DESC LIMIT 1) as last_msg_time
FROM target_ref t
UNION ALL
SELECT 'WARNING', NULL, 0, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.messages);

-- 6. SHOW LAST 5 MESSAGES OF TARGET CONVERSATION
WITH target_ref AS (
  SELECT conversation_id FROM public.messages ORDER BY created_at DESC LIMIT 1
)
SELECT * 
FROM public.messages 
WHERE conversation_id IN (SELECT conversation_id FROM target_ref)
ORDER BY created_at DESC 
LIMIT 5;

-- 7. APPLY SAFER RLS POLICIES (Idempotent V2)
-- We rely on standard column names: user1_id, user2_id, conversation_id, sender_id
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Remove V2 policies if they exist to refresh them
DROP POLICY IF EXISTS "read_own_conversations_v2" ON public.conversations;
DROP POLICY IF EXISTS "read_messages_in_own_conversations_v2" ON public.messages;
DROP POLICY IF EXISTS "send_messages_in_own_conversations_v2" ON public.messages;
DROP POLICY IF EXISTS "update_messages_in_own_conversations_v2" ON public.messages;

-- Create V2 Policies

-- Conversations: Read
CREATE POLICY "read_own_conversations_v2"
ON public.conversations FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages: Read
CREATE POLICY "read_messages_in_own_conversations_v2"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
      AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

-- Messages: Insert
CREATE POLICY "send_messages_in_own_conversations_v2"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
      AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

-- Messages: Update (e.g. for marking read if logic requires client update, usually done via RPC though)
CREATE POLICY "update_messages_in_own_conversations_v2"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
      AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);


-- 8. AUTH SIMULATION (Run manually if needed)
/*
  -- INSTRUCTIONS:
  -- 1. Find a user ID: SELECT id FROM auth.users LIMIT 1;
  -- 2. Paste it in place of <USER_UUID> below.
  -- 3. Select the valid UUID for <CONV_UUID> from the "TARGET_INFO" query above.
  
  BEGIN;
    -- Setup Auth Context
    SELECT set_config('request.jwt.claims', '{"sub":"<USER_UUID>", "role":"authenticated"}', true);
    SELECT set_config('role', 'authenticated', true);
    
    -- Test Query
    SELECT count(*) as my_visible_messages FROM public.messages WHERE conversation_id = '<CONV_UUID>'::uuid;
    
  ROLLBACK;
*/
