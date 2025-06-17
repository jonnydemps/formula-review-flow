
-- Add email column to profiles table since it's missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
