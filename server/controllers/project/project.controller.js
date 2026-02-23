import { supabase } from '../../config/supabase.js';

//list all projects for the current user
export const listProjects = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's profile to check if admin
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', userId)
            .single();

        if (profileError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve user profile',
                message: profileError.message
            });
        }

        let query;

        // If admin, show all projects; otherwise show only projects user is a member of
        if (profile.role === 'admin') {
            query = supabase
                .from('projects')
                .select(`
                    *,
                    project_members(id, role, user_id)
                `);
        } else {
            // Get projects where user is a member
            query = supabase
                .from('projects')
                .select(`
                    *,
                    project_members!inner(role, user_id)
                `)
                .eq('project_members.user_id', userId);
        }

        const { data: projects, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch projects',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        console.error('List projects error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//create a new project (any authenticated user becomes project admin)
export const createProject = async (req, res) => {
    try {
        const { name, description, start_date, target_end_date, status } = req.body;
        const userId = req.user.id;

        // Validation
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Project name is required'
            });
        }

        const projectData = {
            name: name.trim(),
            description: description?.trim() || null,
            created_by: userId,
            status: status || 'active',
            start_date: start_date || null,
            target_end_date: target_end_date || null
        };

        const { data: project, error } = await supabase
            .from('projects')
            .insert([projectData])
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create project',
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            data: project,
            message: 'Project created successfully'
        });
    } catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//get project details
export const getProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const { data: project, error } = await supabase
            .from('projects')
            .select(`
                *,
                project_members(
                    id,
                    role,
                    user_id,
                    added_at
                )
            `)
            .eq('id', projectId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Project not found',
                    message: 'The requested project does not exist'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch project',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Get project error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//update project (Admin only)
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description, status, start_date, target_end_date, actual_end_date } = req.body;

        const updateData = {};

        if (name !== undefined && name.trim() !== '') updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (status !== undefined) updateData.status = status;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (target_end_date !== undefined) updateData.target_end_date = target_end_date;
        if (actual_end_date !== undefined) updateData.actual_end_date = actual_end_date;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'No valid fields to update'
            });
        }

        const { data: project, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', projectId)
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to update project',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: project,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//delete project (Admin only)
export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to delete project',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};
