-- Function to safely add points to a user
CREATE OR REPLACE FUNCTION add_user_points(user_id UUID, points_to_add INTEGER)
RETURNS TABLE(points INTEGER, level INTEGER) AS $$
DECLARE
  current_points INTEGER;
  current_level INTEGER;
  new_points INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current stats or create if they don't exist
  INSERT INTO user_stats (user_id, points, level, streak)
  VALUES (user_id, 0, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current values
  SELECT us.points, us.level INTO current_points, current_level
  FROM user_stats us
  WHERE us.user_id = add_user_points.user_id;
  
  -- Calculate new values
  new_points := current_points + points_to_add;
  
  -- Simple level calculation (every 100 points = 1 level)
  new_level := GREATEST(1, (new_points / 100) + 1);
  
  -- Update stats
  UPDATE user_stats
  SET 
    points = new_points,
    level = new_level,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_stats.user_id = add_user_points.user_id;
  
  -- Return the updated values
  RETURN QUERY SELECT new_points, new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_user_points(UUID, INTEGER) TO authenticated;