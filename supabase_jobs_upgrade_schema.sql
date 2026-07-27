-- Upgrade Jobs Table for Advanced Filters

alter table public.jobs
add column if not exists job_type text, -- 'Full-time', 'Part-time', 'Remote', 'Contract', 'Freelance'
add column if not exists experience_level text, -- 'Entry Level', 'Mid Level', 'Senior', 'Executive'
add column if not exists salary_min numeric,
add column if not exists salary_max numeric;

-- Ensure city column exists (it might be named 'location' or 'city' based on previous context, adding 'city' to be safe and consistent with profile)
add column if not exists city text;

-- Optional: Add index for faster filtering
-- create index if not exists idx_jobs_filters on public.jobs (job_type, experience_level, city);
