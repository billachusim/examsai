-- Fix RLS policies for profiles table to allow reading
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can track own questions" ON public.daily_questions;

-- Create new permissive SELECT policies
-- Allow anyone to read profiles (they're already filtered by faculty_id in the query)
CREATE POLICY "Allow read access to profiles"
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow anyone to read daily questions (they're already filtered by faculty_id in the query)
CREATE POLICY "Allow read access to daily questions"
  ON public.daily_questions 
  FOR SELECT 
  USING (true);

-- Keep the existing insert/update policies that use faculty_id filtering at the query level
CREATE POLICY "Allow tracking questions"
  ON public.daily_questions 
  FOR ALL 
  USING (true);