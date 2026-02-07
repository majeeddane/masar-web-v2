-- Trigger to automatically create a public user profile when a new auth user is created
-- Run this in Supabase SQL Editor

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'seeker'));
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists to avoid errors
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
