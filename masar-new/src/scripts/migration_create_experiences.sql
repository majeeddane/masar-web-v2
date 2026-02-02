-- Create experiences table
create table if not exists public.experiences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  company text not null,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean default false,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.experiences enable row level security;

-- Policies
create policy "Users can view all experiences"
  on public.experiences for select
  using ( true );

create policy "Users can insert their own experiences"
  on public.experiences for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own experiences"
  on public.experiences for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own experiences"
  on public.experiences for delete
  using ( auth.uid() = user_id );
