/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing RLS policies on users table
    - Add new policies that properly handle user registration
    - Ensure authenticated users can still manage their own data
    
  2. Security
    - Enable RLS on users table
    - Add policy for user registration
    - Add policy for authenticated users to read all users
    - Add policy for users to update their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- Create new policies that handle both registration and authenticated access
CREATE POLICY "Enable insert during registration"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users"
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