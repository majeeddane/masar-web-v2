/*
  # Migration: Option 1 - Optimized Read Receipts (conversation_reads)
  
  This script implements a dedicated `conversation_reads` table architecture for tracking read status.
  It avoids high-write throughput on the `messages` table and ensures scalability.

  ## Changes:
  1. Create `conversation_reads` table.
  2. Create RLS policies for `conversation_reads`.
  3. Create/Replace `mark_conversation_read` RPC.
  4. Create/Replace `get_unread_total` RPC.
*/

-- 1. Create conversation_reads table
CREATE TABLE IF NOT EXISTS conversation_reads (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE conversation_reads ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies
-- Users can view their own read status
CREATE POLICY "Users can view their own read status"
  ON conversation_reads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can upsert their own read status (via RPC usually, but policy allows it)
CREATE POLICY "Users can update their own read status"
  ON conversation_reads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read status update"
  ON conversation_reads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. RPC: mark_conversation_read
-- Upserts the last_read_at timestamp for the current user and conversation.
CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO conversation_reads (conversation_id, user_id, last_read_at)
  VALUES (p_conversation_id, auth.uid(), NOW())
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET last_read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC: get_unread_total
-- Calculates total unread messages across ALL conversations for the current user.
-- Efficiently joins messages with conversation_reads.
CREATE OR REPLACE FUNCTION get_unread_total()
RETURNS INTEGER AS $$
DECLARE
  total_unread INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO total_unread
  FROM messages m
  JOIN conversations c ON m.conversation_id = c.id
  LEFT JOIN conversation_reads cr ON m.conversation_id = cr.conversation_id AND cr.user_id = auth.uid()
  WHERE
    (c.user1_id = auth.uid() OR c.user2_id = auth.uid()) -- User MUST be part of conversation
    AND m.sender_id != auth.uid() -- Message is NOT from me
    AND (
      cr.last_read_at IS NULL -- Never read
      OR m.created_at > cr.last_read_at -- New message since last read
    );
    
  RETURN total_unread;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Helper RPC to get unread count for a SPECIFIC conversation (useful for list view badges)
CREATE OR REPLACE FUNCTION get_conversation_unread_count(p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM messages m
  LEFT JOIN conversation_reads cr ON m.conversation_id = cr.conversation_id AND cr.user_id = auth.uid()
  WHERE
    m.conversation_id = p_conversation_id
    AND m.sender_id != auth.uid()
    AND (
      cr.last_read_at IS NULL
      OR m.created_at > cr.last_read_at
    );
    
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration Note:
-- If you want to migrate existing `is_read` status from `messages` table to `conversation_reads`:
-- INSERT INTO conversation_reads (conversation_id, user_id, last_read_at)
-- SELECT conversation_id, user_id, MAX(created_at)
-- FROM messages
-- WHERE is_read = true
-- GROUP BY conversation_id; 
-- (This is complex to map strictly because `is_read` is per message, but option 1 is per conversation.
--  For a cleaner start, it is recommended to start fresh or mark all as read up to now.)
