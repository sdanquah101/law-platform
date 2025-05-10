/*
  # Create categories table

  1. New Tables
    - `categories`
      - `id` (text, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `icon` (text, not null)
      - `question_count` (integer, default 0)
      - `created_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `categories` table
    - Add policies for authenticated users to view categories
*/

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  question_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by all users"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);