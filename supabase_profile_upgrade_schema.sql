-- Database Schema Upgrade for User Profile (Digital CV) --

-- Add new columns to the `profiles` table to support Digital CV functionality.
alter table public.profiles
add column if not exists bio text,
add column if not exists city text,
add column if not exists phone_number text,
add column if not exists linkedin_url text,
add column if not exists portfolio_url text,
add column if not exists skills text[],
add column if not exists job_title text;

-- Optional: Create an index for faster skill search (if using text[] and pg_trgm)
-- create extension if not exists pg_trgm;
-- create index if not exists idx_profiles_skills on public.profiles using gin(skills);
