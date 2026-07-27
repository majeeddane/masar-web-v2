-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  phone text,
  role text check (role in ('employer', 'seeker', 'admin')) default 'seeker',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for Users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Jobs Table
create table if not exists public.jobs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  city text,
  salary text,
  category text,
  contact_email text,
  contact_phone text,
  job_hash text unique,
  seo_url text unique,
  skills_required jsonb, -- [NEW] Array of strings: ["React", "Node.js"]
  is_active boolean default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.jobs enable row level security;

-- Policies for Jobs
create policy "Public can view active jobs" on public.jobs
  for select using (is_active = true);

create policy "Employers can manage their own jobs" on public.jobs
  for all using (auth.uid() = created_by);

-- CVs Table
create table if not exists public.cvs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text default 'My CV',
  data jsonb,
  skills_extracted jsonb, -- [NEW] AI Extracted skills from the CV
  pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.cvs enable row level security;

-- Policies for CVs
create policy "Users can CRUD their own CVs" on public.cvs
  for all using (auth.uid() = user_id);

-- Applications Table
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  status text default 'pending',
  cv_url text,
  cover_letter text,
  ai_cover_letter text, -- [NEW] AI Generated Cover Letter
  match_score integer, -- [NEW] 0-100 Score
  applied_at timestamptz default now(),
  unique(job_id, user_id)
);

-- Enable RLS
alter table public.applications enable row level security;

-- Policies for Applications
create policy "Seekers can view their own applications" on public.applications
  for select using (auth.uid() = user_id);

create policy "Employers can view applications for their jobs" on public.applications
  for select using (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
      and jobs.created_by = auth.uid()
    )
  );

-- Function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'seeker'));
  return new;
end;
$$ language plpgsql security definer;
