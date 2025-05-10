/*
  # Create increment_user_xp function

  1. New Function
    - `increment_user_xp` - A function to increment a user's XP and handle level ups
      - Parameters:
        - `user_id` (uuid) - The ID of the user
        - `xp_amount` (integer) - The amount of XP to add
      - Returns: boolean
*/

CREATE OR REPLACE FUNCTION increment_user_xp(user_id uuid, xp_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_xp integer;
  current_level integer;
  xp_for_next_level integer;
  new_level integer;
BEGIN
  -- Get current XP and level
  SELECT xp, level INTO current_xp, current_level
  FROM users
  WHERE id = user_id;
  
  -- Calculate new XP
  current_xp := current_xp + xp_amount;
  
  -- Calculate XP needed for next level (100 XP per level)
  xp_for_next_level := current_level * 100;
  
  -- Check if user should level up
  IF current_xp >= xp_for_next_level THEN
    new_level := current_level + 1;
  ELSE
    new_level := current_level;
  END IF;
  
  -- Update user
  UPDATE users
  SET 
    xp = current_xp,
    level = new_level
  WHERE id = user_id;
  
  RETURN true;
END;
$$;