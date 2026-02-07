-- Migration to add cv_url to profiles
-- Run in Supabase SQL Editor

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_url text;

-- Also ensure storage bucket 'resumes' exists or use 'cvs'
-- Usually we create buckets via dashboard, but we can verify in code or assume 'resumes'
-- For now, we will use a 'resumes' bucket in our logic.
