-- Create jobs table
create table if not exists public.jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  company_name text not null,
  location text not null,
  type text not null,
  salary_range text,
  description text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.jobs enable row level security;

-- Policies
create policy "Anyone can view active jobs"
  on public.jobs for select
  using ( is_active = true );

create policy "Users can insert their own jobs"
  on public.jobs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own jobs"
  on public.jobs for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own jobs"
  on public.jobs for delete
  using ( auth.uid() = user_id );
