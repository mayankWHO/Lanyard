import { supabase } from '../../config/supabase.js';
import { PROJECT_ROLES, normalizeRole } from '../../utils/rbac.js';

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

        const platformRole = normalizeRole(profile.role);
        let accessibleProjectIds = null;

        if (platformRole === PROJECT_ROLES.MEMBER || platformRole === PROJECT_ROLES.VIEWER) {
            const { data: membershipRows, error: membershipError } = await supabase
                .from('project_members')
                .select('project_id')
                .eq('user_id', userId);

            if (membershipError) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch project memberships',
                    message: membershipError.message
                });
            }

            accessibleProjectIds = membershipRows.map((membership) => membership.project_id);

            if (accessibleProjectIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    count: 0
                });
            }
        }

        let projectQuery = supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (accessibleProjectIds) {
            projectQuery = projectQuery.in('id', accessibleProjectIds);
        }

        const { data: projects, error } = await projectQuery;

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch projects',
                message: error.message
            });
        }

        const projectIds = projects.map((project) => project.id);
        const { data: memberships, error: membershipsError } = projectIds.length > 0
            ? await supabase
                .from('project_members')
                .select('id, project_id, role, user_id, added_at')
                .in('project_id', projectIds)
            : { data: [], error: null };

        if (membershipsError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch project memberships',
                message: membershipsError.message
            });
        }

        const membershipsByProject = (memberships ?? []).reduce((acc, membership) => {
            if (!acc[membership.project_id]) {
                acc[membership.project_id] = [];
            }

            acc[membership.project_id].push({
                ...membership,
                role: normalizeRole(membership.role)
            });

            return acc;
        }, {});

        const data = projects.map((project) => {
            const projectMembers = membershipsByProject[project.id] ?? [];
            const currentMembership = projectMembers.find((member) => member.user_id === userId);

            return {
                ...project,
                project_members: projectMembers,
                current_user_role: currentMembership?.role ?? platformRole
            };
        });

        return res.status(200).json({
            success: true,
            data,
            count: data.length
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
            .select('*')
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

        const { data: members, error: membersError } = await supabase
            .from('project_members')
            .select('id, role, user_id, added_at')
            .eq('project_id', projectId)
            .order('added_at', { ascending: true });

        if (membersError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch project members',
                message: membersError.message
            });
        }

        const normalizedMembers = (members ?? []).map((member) => ({
            ...member,
            role: normalizeRole(member.role)
        }));

        const userIds = normalizedMembers.map((member) => member.user_id);
        const { data: profiles, error: profilesError } = userIds.length > 0
            ? await supabase
                .from('user_profiles')
                .select('user_id, full_name, avatar_url')
                .in('user_id', userIds)
            : { data: [], error: null };

        if (profilesError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch member profiles',
                message: profilesError.message
            });
        }

        const profilesById = (profiles ?? []).reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
        }, {});

        const enrichedMembers = normalizedMembers.map((member) => ({
            ...member,
            full_name: profilesById[member.user_id]?.full_name ?? null,
            avatar_url: profilesById[member.user_id]?.avatar_url ?? null
        }));

        const currentMembership = enrichedMembers.find((member) => member.user_id === req.user.id);

        return res.status(200).json({
            success: true,
            data: {
                ...project,
                project_members: enrichedMembers,
                current_user_role: currentMembership?.role ?? PROJECT_ROLES.MEMBER
            }
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
