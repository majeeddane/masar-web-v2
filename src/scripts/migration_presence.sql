-- Secure Migration for Presence System (Profiles & Status)

-- 1. Create 'profiles' table safely
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS (Strict Access Control)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drops existing policies to ensure clean slate (idempotent)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. Secure Policies

-- Policy: Authenticated users can VIEW presence/profiles (Privacy Fix)
-- Prevents public/anon access.
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Users can UPDATE their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Policy: Users can INSERT their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 5. Secure Function for Presence

-- Drop legacy function if exists
DROP FUNCTION IF EXISTS public.set_presence(boolean);

-- Create secure function
-- SECURITY DEFINER: Runs with privileges of the creator (usually postgres/admin), 
-- allowing it to bypass RLS if needed, but we restrict it carefully via search_path.
CREATE OR REPLACE FUNCTION public.set_presence(p_is_online BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Critical: Prevent search_path hijacking
AS $$
BEGIN
  -- Insert or Update profile for the *current* user only
  INSERT INTO public.profiles (id, is_online, last_seen_at)
  VALUES (auth.uid(), p_is_online, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    is_online = EXCLUDED.is_online,
    last_seen_at = NOW();
END;
$$;

-- 6. Lock down permissions
-- Revoke all public access first
REVOKE ALL ON FUNCTION public.set_presence(boolean) FROM PUBLIC;

-- Grant execute ONLY to authenticated users
GRANT EXECUTE ON FUNCTION public.set_presence(boolean) TO authenticated;
