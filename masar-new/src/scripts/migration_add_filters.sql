-- Migration to add advanced filtering columns
-- Run in Supabase SQL Editor

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_type text; -- 'Full-time', 'Part-time', 'Contract'
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_level text; -- 'Entry', 'Mid', 'Senior'
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_min integer;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_max integer;
