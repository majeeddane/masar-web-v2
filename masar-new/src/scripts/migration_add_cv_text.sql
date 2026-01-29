-- Migration to add content_text to cvs table
-- Run in Supabase SQL Editor

ALTER TABLE public.cvs ADD COLUMN IF NOT EXISTS content_text text;
