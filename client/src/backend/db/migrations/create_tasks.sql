-- Migration for tasks table

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_critical BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Ai shi
  goal TEXT,
  expected_outcome TEXT,
  definition_of_done TEXT,
  
  -- Execution Tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  
  -- Ai suggestions
  is_stagnant BOOLEAN DEFAULT false,
  days_in_current_status INTEGER DEFAULT 0,
  ai_suggested_assignee UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- File Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- indexes for faster fetching
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_priority ON tasks(project_id, priority);
CREATE INDEX idx_tasks_stagnant ON tasks(is_stagnant) WHERE is_stagnant = true;

-- enable rls
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- rls policies
CREATE POLICY tasks_select_policy ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY tasks_insert_policy ON tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN user_profiles up ON up.user_id = auth.uid()
      WHERE pm.project_id = tasks.project_id
      AND pm.user_id = auth.uid()
      AND (up.role = 'admin' OR pm.role = 'project_admin')
    )
  );

CREATE POLICY tasks_update_policy ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN user_profiles up ON up.user_id = auth.uid()
      WHERE pm.project_id = tasks.project_id
      AND pm.user_id = auth.uid()
      AND (
        up.role = 'admin' 
        OR pm.role = 'project_admin'
        OR tasks.assigned_to = auth.uid()
      )
    )
  );

CREATE POLICY tasks_delete_policy ON tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN user_profiles up ON up.user_id = auth.uid()
      WHERE pm.project_id = tasks.project_id
      AND pm.user_id = auth.uid()
      AND (up.role = 'admin' OR pm.role = 'project_admin')
    )
  );

-- trigger to auto-update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- function to track status transitions
CREATE OR REPLACE FUNCTION track_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Track when task moves to in_progress
  IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
    NEW.started_at = now();
  END IF;
  
  -- Track when task is completed
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_task_status_change
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_task_status_change();
