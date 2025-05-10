/*
  # Create quiz_results table

  1. New Tables
    - `quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `score` (integer, not null)
      - `total_questions` (integer, not null)
      - `time_taken` (integer, not null) - in seconds
      - `category` (text, nullable)
      - `created_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `quiz_results` table
    - Add policies for authenticated users to view their own results
    - Add policies for users to insert their own results
*/

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  score integer NOT NULL,
  total_questions integer NOT NULL,
  time_taken integer NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);