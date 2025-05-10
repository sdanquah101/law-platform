/*
  # Add time tracking to user answers

  1. Changes
    - Add time_spent column to user_answers table
    - Add average_time column to user_profiles table
    - Add difficulty_preference column to user_profiles table
    
  2. Purpose
    - Track time spent on each question
    - Calculate average response time
    - Store user's preferred difficulty level
*/

-- Add time tracking to user_answers
ALTER TABLE user_answers
ADD COLUMN time_spent integer NOT NULL DEFAULT 0;

-- Add average time and difficulty preference to user_profiles
ALTER TABLE user_profiles
ADD COLUMN average_time integer DEFAULT 0,
ADD COLUMN difficulty_preference text DEFAULT 'medium';

-- Create function to update average time
CREATE OR REPLACE FUNCTION update_user_average_time()
RETURNS trigger AS $$
BEGIN
  UPDATE user_profiles
  SET average_time = (
    SELECT AVG(time_spent)::integer
    FROM user_answers
    WHERE user_id = NEW.user_id
  )
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update average time
CREATE TRIGGER update_average_time
AFTER INSERT ON user_answers
FOR EACH ROW
EXECUTE FUNCTION update_user_average_time();

-- Create function to adjust difficulty preference
CREATE OR REPLACE FUNCTION adjust_difficulty_preference()
RETURNS trigger AS $$
DECLARE
  correct_rate float;
  avg_time float;
BEGIN
  -- Calculate success rate and average time for last 10 questions
  SELECT 
    AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) as success_rate,
    AVG(time_spent) as avg_time_spent
  INTO correct_rate, avg_time
  FROM (
    SELECT is_correct, time_spent
    FROM user_answers
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 10
  ) recent_answers;

  -- Adjust difficulty based on performance
  UPDATE user_profiles
  SET difficulty_preference = 
    CASE 
      WHEN correct_rate > 0.8 AND avg_time < 60 THEN 'hard'
      WHEN correct_rate < 0.4 OR avg_time > 120 THEN 'easy'
      ELSE 'medium'
    END
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to adjust difficulty
CREATE TRIGGER adjust_difficulty
AFTER INSERT ON user_answers
FOR EACH ROW
EXECUTE FUNCTION adjust_difficulty_preference();