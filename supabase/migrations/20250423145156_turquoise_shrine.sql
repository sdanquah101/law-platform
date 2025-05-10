/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing RLS policies on users table
    - Create new policies that properly handle user registration and profile management
    
  2. Security
    - Allow public registration
    - Restrict profile updates to own profile
    - Allow authenticated users to view all profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- Create new policies with proper permissions
CREATE POLICY "Enable insert for registration"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable read access for all authenticated users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for users based on user_id"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);