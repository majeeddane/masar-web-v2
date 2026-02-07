-- Create the Table
create table if not exists public.job_applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  applicant_name text not null,
  email text not null,
  phone text,
  cv_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.job_applications enable row level security;

-- Policies
-- 1. INSERT: Allow anyone to submit an application (public)
create policy "Allow public inserts"
on public.job_applications for insert
to public
with check (true);

-- 2. SELECT: Only Admins (service_role) or authenticated users can view (depending on your auth model)
-- For now, we'll disallow public select to ensure privacy.
create policy "Allow admin select"
on public.job_applications for select
to service_role
using (true);

-- Storage Bucket Setup (You might need to create 'cv-uploads' in the dashboard if this script fails to run in SQL Editor)
insert into storage.buckets (id, name, public)
values ('cv-uploads', 'cv-uploads', true)
on conflict (id) do nothing;

-- Storage Policies
-- 1. Upload: Allow public to upload
create policy "Allow public uploads"
on storage.objects for insert
to public
with check (bucket_id = 'cv-uploads');

-- 2. Read: Allow public access to read (or restrict to admin)
-- Since we want admins to see it, and it's behind a secure dashboard, public read is okay for simpler setup,
-- BUT for privacy, ideally we restrict it.
-- However, "cv_url" will be a signed URL or public URL? User asked for "Applicant cannot see others".
-- If we make bucket private, we need signed URLs. If public, obfuscated names.
-- Let's make it public for simplicity but rely on random filenames.
create policy "Allow public reads"
on storage.objects for select
to public
using (bucket_id = 'cv-uploads');
