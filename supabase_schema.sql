-- Create applications table
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  seeker_id uuid references public.profiles(id) on delete cascade not null,
  employer_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, seeker_id) -- Prevent double application
);

-- Enable RLS
alter table public.applications enable row level security;

-- Policies
create policy "Seekers can insert their own applications"
  on public.applications for insert
  with check (auth.uid() = seeker_id);

create policy "Seekers can view their own applications"
  on public.applications for select
  using (auth.uid() = seeker_id);

create policy "Employers can view applications for their jobs"
  on public.applications for select
  using (auth.uid() = employer_id);

create policy "Employers can update status of applications for their jobs"
  on public.applications for update
  using (auth.uid() = employer_id);

-- Add Admin and Verification columns to profiles
alter table public.profiles 
add column if not exists is_admin boolean default false,
add column if not exists is_verified boolean default false,
add column if not exists is_blocked boolean default false;

-- Create policy for Admins to update profiles (e.g. verify users)
create policy "Admins can update any profile"
  on public.profiles for update
  using ( (select is_admin from public.profiles where id = auth.uid()) = true );

-- Create policy for Admins to delete jobs
create policy "Admins can delete any job"
  on public.jobs for delete
  using ( (select is_admin from public.profiles where id = auth.uid()) = true );
