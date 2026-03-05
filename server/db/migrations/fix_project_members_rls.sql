-- 4. Fix Project Members Insert (Allow Project Admins to invite)
DROP POLICY IF EXISTS project_members_insert_policy ON project_members;
CREATE POLICY project_members_insert_policy ON project_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('admin', 'project_admin')
    )
    OR 
    -- For edge case where user creates project and trigger inserts them
    user_id = auth.uid()
  );

-- 5. Fix Project Members Update (Allow Project Admins to edit roles)
DROP POLICY IF EXISTS project_members_update_policy ON project_members;
CREATE POLICY project_members_update_policy ON project_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('admin', 'project_admin')
    )
  );

-- 6. Fix Project Members Delete (Allow Project Admins to remove members)
DROP POLICY IF EXISTS project_members_delete_policy ON project_members;
CREATE POLICY project_members_delete_policy ON project_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('admin', 'project_admin')
    )
  );
