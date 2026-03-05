-- Run this in your Supabase SQL Editor to fix the infinite recursion!

-- 1. Create a helper function that runs bypasses RLS to check for project membership
CREATE OR REPLACE FUNCTION is_project_member(_project_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = _project_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Drop the recursive policy from project_members
DROP POLICY IF EXISTS project_members_select_policy ON project_members;

-- 3. Create the new, non-recursive policy for project_members
CREATE POLICY project_members_select_policy ON project_members
  FOR SELECT
  USING (
    -- You are an Admin
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
    OR 
    -- It is your own membership row
    user_id = auth.uid()
    OR 
    -- You are querying other members of a project you are a part of
    is_project_member(project_id)
  );
