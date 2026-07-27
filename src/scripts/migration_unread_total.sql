-- Function to get total unread messages count for the current user
CREATE OR REPLACE FUNCTION get_unread_total()
RETURNS BIGINT
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT COALESCE(COUNT(*),0)::bigint
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    AND m.sender_id <> auth.uid()
    AND m.is_read = false;
$$;
