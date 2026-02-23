-- Migration for notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_decision BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Ai columns
  ai_summary TEXT,
  ai_action_items JSONB DEFAULT '[]'::jsonb,
  ai_decisions_extracted JSONB DEFAULT '[]'::jsonb,
  last_ai_analysis TIMESTAMP WITH TIME ZONE,
  contains_blocker_language BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- indexes for faster fetching
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_category ON notes(project_id, category);
CREATE INDEX idx_notes_pinned ON notes(project_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_notes_decisions ON notes(project_id, is_decision) WHERE is_decision = true;
CREATE INDEX idx_notes_blockers ON notes(project_id, contains_blocker_language) WHERE contains_blocker_language = true;
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- enable rls
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- rls policies
CREATE POLICY notes_select_policy ON notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = notes.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY notes_insert_policy ON notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY notes_update_policy ON notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY notes_delete_policy ON notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- autoupd created at and updated at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- function to track last editor
CREATE OR REPLACE FUNCTION track_note_editor()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_note_update
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION track_note_editor();
