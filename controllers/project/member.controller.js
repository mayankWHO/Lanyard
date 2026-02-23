import { supabase } from '../../config/supabase.js';

//list project members
export const listProjectMembers = async (req, res) => {
    try {
        const { projectId } = req.params;

        const { data: members, error } = await supabase
            .from('project_members')
            .select(`
                id,
                role,
                user_id,
                added_by,
                added_at
            `)
            .eq('project_id', projectId)
            .order('added_at', { ascending: true });

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch project members',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: members,
            count: members.length
        });
    } catch (error) {
        console.error('List project members error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//add member to project (Admin only)
export const addProjectMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { user_id, role } = req.body;
        const addedBy = req.user.id;

        // Validation
        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'User ID is required'
            });
        }


       
        const validRoles = ['owner', 'member', 'viewer', 'admin', 'project_admin'];
        const memberRole = role || 'member';

        if (!validRoles.includes(memberRole)) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Invalid role. Must be one of: owner, member, viewer'
            });
        }


        // Check if user exists
        const { data: userExists, error: userCheckError } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('user_id', user_id)
            .single();

        if (userCheckError || !userExists) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                message: 'The specified user does not exist'
            });
        }

        // Check if project exists
        const { data: projectExists, error: projectCheckError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .single();

        if (projectCheckError || !projectExists) {
            return res.status(404).json({
                success: false,
                error: 'Project not found',
                message: 'The specified project does not exist'
            });
        }

        // Check if user is already a member
        const { data: existingMember } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', user_id)
            .single();

        if (existingMember) {
            return res.status(409).json({
                success: false,
                error: 'Conflict',
                message: 'User is already a member of this project'
            });
        }

        // Add member
        const { data: member, error } = await supabase
            .from('project_members')
            .insert([{
                project_id: projectId,
                user_id: user_id,
                role: memberRole,
                added_by: addedBy
            }])
            .select(`
                id,
                role,
                user_id,
                added_by,
                added_at
            `)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to add project member',
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            data: member,
            message: 'Member added to project successfully'
        });
    } catch (error) {
        console.error('Add project member error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//update project member role
export const updateProjectMember = async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        const { role } = req.body;

        // Validation
        if (!role) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Role is required'
            });
        }

        const validRoles = ['owner', 'member', 'viewer', 'admin', 'project_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Invalid role. Must be one of: owner, member, viewer'
            });
        }

        // Check if member exists
        const { data: existingMember } = await supabase
            .from('project_members')
            .select('id, role')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .single();

        if (!existingMember) {
            return res.status(404).json({
                success: false,
                error: 'Member not found',
                message: 'The specified user is not a member of this project'
            });
        }

        // Update member role
        const { data: member, error } = await supabase
            .from('project_members')
            .update({ role })
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .select(`
                id,
                role,
                user_id,
                added_by,
                added_at
            `)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to update member role',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: member,
            message: 'Member role updated successfully'
        });
    } catch (error) {
        console.error('Update project member error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//remove project member
export const removeProjectMember = async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        // Check if member exists
        const { data: existingMember } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .single();

        if (!existingMember) {
            return res.status(404).json({
                success: false,
                error: 'Member not found',
                message: 'The specified user is not a member of this project'
            });
        }

        // Remove member
        const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to remove project member',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Member removed from project successfully'
        });
    } catch (error) {
        console.error('Remove project member error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};
