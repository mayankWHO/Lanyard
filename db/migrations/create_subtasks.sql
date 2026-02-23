-- Migration for subtasks table

CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- indexes for faster fetching
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_subtasks_task_order ON subtasks(task_id, order_index);
CREATE INDEX idx_subtasks_completion ON subtasks(task_id, is_completed);

-- enable rls
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- rls policies
CREATE POLICY subtasks_select_policy ON subtasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE t.id = subtasks.task_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY subtasks_insert_policy ON subtasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      JOIN user_profiles up ON up.user_id = auth.uid()
      WHERE t.id = subtasks.task_id
      AND pm.user_id = auth.uid()
      AND (up.role = 'admin' OR pm.role = 'project_admin')
    )
  );

CREATE POLICY subtasks_update_policy ON subtasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE t.id = subtasks.task_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY subtasks_delete_policy ON subtasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      JOIN user_profiles up ON up.user_id = auth.uid()
      WHERE t.id = subtasks.task_id
      AND pm.user_id = auth.uid()
      AND (up.role = 'admin' OR pm.role = 'project_admin')
    )
  );

-- trigger to auto-update updated_at
CREATE TRIGGER update_subtasks_updated_at
  BEFORE UPDATE ON subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

--function to track subtask completion
CREATE OR REPLACE FUNCTION track_subtask_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = now();
  ELSIF NEW.is_completed = false AND OLD.is_completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger to track subtask completion
CREATE TRIGGER on_subtask_completion_change
  BEFORE UPDATE ON subtasks
  FOR EACH ROW
  WHEN (OLD.is_completed IS DISTINCT FROM NEW.is_completed)
  EXECUTE FUNCTION track_subtask_completion();
