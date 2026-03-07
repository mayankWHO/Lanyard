const supabase = require('./client');

async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data;
}

async function getUserProjects(userId) {
    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      project_members!inner(role)
    `)
        .eq('project_members.user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

async function getProjectById(projectId, userId) {
    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      project_members!inner(user_id, role)
    `)
        .eq('id', projectId)
        .eq('project_members.user_id', userId)
        .single();

    if (error) throw error;
    return data;
}

async function getProjectMembers(projectId) {
    const { data, error } = await supabase
        .from('project_members')
        .select(`
      *,
      user_profiles(user_id, full_name, avatar_url, role)
    `)
        .eq('project_id', projectId)
        .order('added_at', { ascending: true });

    if (error) throw error;
    return data;
}

async function getProjectTasks(projectId, filters = {}) {
    let query = supabase
        .from('tasks')
        .select(`
      *,
      assigned_user:assigned_to(id, full_name, avatar_url),
      subtasks(id, title, is_completed)
    `)
        .eq('project_id', projectId);

    if (filters.status) {
        query = query.eq('status', filters.status);
    }
    if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters.priority) {
        query = query.eq('priority', filters.priority);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function getTaskById(taskId) {
    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      project:projects(*),
      assigned_user:assigned_to(id, full_name, avatar_url),
      created_user:created_by(id, full_name, avatar_url),
      subtasks(*)
    `)
        .eq('id', taskId)
        .single();

    if (error) throw error;
    return data;
}

async function getProjectNotes(projectId, filters = {}) {
    let query = supabase
        .from('notes')
        .select(`
      *,
      author:created_by(id, full_name, avatar_url),
      editor:last_edited_by(id, full_name)
    `)
        .eq('project_id', projectId);

    if (filters.category) {
        query = query.eq('category', filters.category);
    }
    if (filters.is_pinned) {
        query = query.eq('is_pinned', true);
    }
    if (filters.is_decision) {
        query = query.eq('is_decision', true);
    }

    query = query.order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function isProjectMember(projectId, userId) {
    const { data, error } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

async function isAdmin(userId) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data.role === 'admin';
}

async function isProjectAdmin(projectId, userId) {
    const member = await isProjectMember(projectId, userId);
    if (!member) return false;

    const admin = await isAdmin(userId);
    return admin || member.role === 'project_admin';
}

module.exports = {
    getUserProfile,
    getUserProjects,
    getProjectById,
    getProjectMembers,
    getProjectTasks,
    getTaskById,
    getProjectNotes,
    isProjectMember,
    isAdmin,
    isProjectAdmin
};
