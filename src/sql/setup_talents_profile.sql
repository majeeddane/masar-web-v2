-- Create profiles table for Talents
-- Note: User requested table name 'profiles'.
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  job_title text,
  location text,
  bio text,
  email text,
  phone text,
  skills text[], -- Array of strings
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Policy: Allow anyone to insert (public join form)
create policy "Enable insert for everyone" on profiles for insert with check (true);

-- Policy: Allow read access to everyone (public profiles)
create policy "Enable read access for everyone" on profiles for select using (true);


-- Create Storage Bucket for Avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policy: Allow public uploads to avatars
create policy "Allow public uploads" on storage.objects
for insert with check ( bucket_id = 'avatars' );

-- Storage Policy: Allow public download
create policy "Allow public downloads" on storage.objects
for select using ( bucket_id = 'avatars' );
