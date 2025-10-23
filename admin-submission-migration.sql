-- Admin Submission System Migration
-- Run this after the main database-migration.sql

-- Add submission review fields to user_activities table
ALTER TABLE public.user_activities 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS submission_title VARCHAR(255);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activities_status ON public.user_activities(status);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_reviewed_by ON public.user_activities(reviewed_by);

-- Update existing records to have 'approved' status (backward compatibility)
UPDATE public.user_activities 
SET status = 'approved' 
WHERE status IS NULL OR status = 'pending';

-- Add admin policies for managing submissions
CREATE POLICY "Admins can view all submissions" ON public.user_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.username ILIKE '%admin%' OR profiles.email ILIKE '%admin%')
    )
  );

CREATE POLICY "Admins can update submission status" ON public.user_activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.username ILIKE '%admin%' OR profiles.email ILIKE '%admin%')
    )
  );

-- Create a view for easier querying of submissions with user/activity details
CREATE OR REPLACE VIEW public.activity_submissions AS
SELECT 
  ua.*,
  p.username,
  p.avatar_url,
  p.country,
  a.title as activity_title,
  a.description as activity_description,
  a.points as activity_points
FROM public.user_activities ua
LEFT JOIN public.profiles p ON ua.user_id = p.id
LEFT JOIN public.activities a ON ua.activity_id = a.id
ORDER BY ua.completed_at DESC;

-- Grant access to the view
GRANT SELECT ON public.activity_submissions TO authenticated;

-- Create function to get submission statistics
CREATE OR REPLACE FUNCTION public.get_submission_stats()
RETURNS TABLE (
  total_count bigint,
  pending_count bigint,
  approved_count bigint,
  rejected_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
  FROM public.user_activities;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_submission_stats() TO authenticated;

-- Create function to update submission status
CREATE OR REPLACE FUNCTION public.update_submission_status(
  submission_id integer,
  new_status text,
  notes text DEFAULT NULL,
  reviewer_id uuid DEFAULT NULL
)
RETURNS public.user_activities AS $$
DECLARE
  updated_submission public.user_activities;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.username ILIKE '%admin%' OR profiles.email ILIKE '%admin%')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Update the submission
  UPDATE public.user_activities 
  SET 
    status = new_status,
    reviewed_at = CURRENT_TIMESTAMP,
    reviewed_by = COALESCE(reviewer_id, auth.uid()),
    review_notes = notes
  WHERE id = submission_id
  RETURNING * INTO updated_submission;

  -- If approved, ensure points are awarded
  IF new_status = 'approved' AND updated_submission.points_earned = 0 THEN
    UPDATE public.user_activities 
    SET points_earned = (
      SELECT points FROM public.activities WHERE id = updated_submission.activity_id
    )
    WHERE id = submission_id;
    
    -- Update user stats
    INSERT INTO public.user_stats (user_id, points)
    VALUES (updated_submission.user_id, updated_submission.points_earned)
    ON CONFLICT (user_id) 
    DO UPDATE SET points = user_stats.points + EXCLUDED.points;
  END IF;

  RETURN updated_submission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_submission_status(integer, text, text, uuid) TO authenticated;