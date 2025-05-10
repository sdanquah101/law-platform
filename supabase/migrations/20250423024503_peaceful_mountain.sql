/*
  # Create user_answers table

  1. New Tables
    - `user_answers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `question_id` (uuid, foreign key to questions.id)
      - `is_correct` (boolean, not null)
      - `answer_index` (integer, not null)
      - `created_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `user_answers` table
    - Add policies for authenticated users to view their own answers
    - Add policies for users to insert their own answers
*/

CREATE TABLE IF NOT EXISTS user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  question_id uuid NOT NULL REFERENCES questions(id),
  is_correct boolean NOT NULL,
  answer_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own answers"
  ON user_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own answers"
  ON user_answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);