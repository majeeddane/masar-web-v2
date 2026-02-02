-- Create applications table if not exists (User mentioned it might exist, but safer to create if distinct)
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) not null,
  applicant_id uuid references auth.users(id) not null,
  status text default 'pending', -- pending, accepted, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, applicant_id) -- Prevent duplicate applications
);

-- Enable RLS
alter table public.applications enable row level security;

-- Policies
create policy "Users can view their own applications"
  on public.applications for select
  using ( auth.uid() = applicant_id );

create policy "Users can insert their own applications"
  on public.applications for insert
  with check ( auth.uid() = applicant_id );

-- IMPORTANT: Job owners (employers) need to view applications for their jobs.
-- This requires a more complex policy involving a join with the jobs table.
-- For simplicity in this demo, we might allow applicants to see their own,
-- but distinct logic is needed for employers.
-- Let's try to add a policy for job owners:
create policy "Job owners can view applications for their jobs"
  on public.applications for select
  using (
    exists (
      select 1 from public.jobs
      where public.jobs.id = public.applications.job_id
      and public.jobs.user_id = auth.uid()
    )
  );

-- Also allow job owners to update status
create policy "Job owners can update application status"
  on public.applications for update
  using (
      exists (
      select 1 from public.jobs
      where public.jobs.id = public.applications.job_id
      and public.jobs.user_id = auth.uid()
    )
  );
