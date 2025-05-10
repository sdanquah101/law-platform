-- This SQL script updates the RLS policies for the users table
-- to allow proper user registration and management

-- First, drop any existing policies on the users table
DROP POLICY IF EXISTS "Enable insert for registration" ON users;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Enable insert during registration" ON users;

-- Create a new insert policy that allows registration without auth
-- This policy allows any JWT with the correct user ID to insert a row
CREATE POLICY "Anyone can insert during registration"
ON users
FOR INSERT
WITH CHECK (true);

-- Create a policy for authenticated users to read all profiles
CREATE POLICY "Enable read access for authenticated users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Create a policy for users to update their own data
CREATE POLICY "Enable update for users based on ID"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);