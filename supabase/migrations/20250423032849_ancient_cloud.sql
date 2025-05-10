/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing RLS policies on users table
    - Create new policies that properly handle:
      - INSERT during registration (public)
      - SELECT for authenticated users
      - UPDATE for users own data
  
  2. Security
    - Enable RLS
    - Add policies for proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert during registration" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- Create new policies
CREATE POLICY "Enable insert for registration"
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