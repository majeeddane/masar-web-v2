-- Add user_id column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Optional: Create an index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
