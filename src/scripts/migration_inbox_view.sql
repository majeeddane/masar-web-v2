-- Create a function to fetch the inbox for the current user
-- This function returns conversations with the other participant's details and the last message.

CREATE OR REPLACE FUNCTION get_inbox()
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_avatar TEXT,
    job_id UUID,
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    last_message_is_read BOOLEAN,
    last_message_sender_id UUID,
    unread_count BIGINT
) 
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN QUERY
    WITH diff_users AS (
        -- Determine the "other" user in the conversation
        SELECT 
            c.id,
            c.job_id,
            CASE 
                WHEN c.user1_id = auth.uid() THEN c.user2_id
                ELSE c.user1_id
            END as partner_id
        FROM conversations c
        WHERE c.user1_id = auth.uid() OR c.user2_id = auth.uid()
    ),
    last_msgs AS (
        -- Get the last message for each conversation
        SELECT DISTINCT ON (m.conversation_id)
            m.conversation_id,
            m.content,
            m.created_at,
            m.is_read,
            m.sender_id
        FROM messages m
        WHERE m.conversation_id IN (SELECT id FROM diff_users)
        ORDER BY m.conversation_id, m.created_at DESC
    ),
    unread_counts AS (
        -- Count unread messages where the current user is the receiver (sender != auth.uid())
        SELECT 
            m.conversation_id,
            COUNT(*) as count
        FROM messages m
        WHERE m.conversation_id IN (SELECT id FROM diff_users)
          AND m.sender_id != auth.uid()
          AND m.is_read = FALSE
        GROUP BY m.conversation_id
    )
    SELECT 
        du.id,
        du.partner_id,
        COALESCE(p.full_name, 'مستخدم'), -- Fallback if profile not found
        NULL::TEXT as avatar_url, -- Placeholder, update if avatar column exists
        du.job_id,
        lm.content,
        lm.created_at,
        lm.is_read,
        lm.sender_id,
        COALESCE(uc.count, 0)
    FROM diff_users du
    LEFT JOIN profiles p ON p.user_id = du.partner_id
    LEFT JOIN last_msgs lm ON lm.conversation_id = du.id
    LEFT JOIN unread_counts uc ON uc.conversation_id = du.id
    ORDER BY lm.created_at DESC NULLS LAST;
END;
$$;
