-- RLS fix

-- Drop the existing policy
DROP POLICY IF EXISTS project_members_select_policy ON project_members;

CREATE POLICY project_members_select_policy ON project_members
  FOR SELECT
  USING (
    
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
    OR
    user_id = auth.uid()
    OR
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm
      WHERE pm.user_id = auth.uid()
    )
  );
