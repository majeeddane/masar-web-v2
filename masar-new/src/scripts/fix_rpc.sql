-- Function to mark all unread messages in a conversation as read for the current user
-- Updates messages where sender is NOT the current user and is_read is false.

CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    affected_rows BIGINT;
BEGIN
    UPDATE messages
    SET is_read = TRUE
    WHERE conversation_id = p_conversation_id
      AND sender_id <> auth.uid()
      AND is_read = FALSE;
      
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN affected_rows;
END;
$$;
