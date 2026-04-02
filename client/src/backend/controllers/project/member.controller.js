import { supabase } from '../../config/supabase.js';
import { PROJECT_ROLES, normalizeRole } from '../../utils/rbac.js';

//list project members
export const listProjectMembers = async (req, res) => {
    try {
        const { projectId } = req.params;

        const { data: members, error } = await supabase
            .from('project_members')
            .select('id, role, user_id, added_by, added_at')
            .eq('project_id', projectId)
            .order('added_at', { ascending: true });

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch project members',
                message: error.message
            });
        }

        const userIds = (members ?? []).map((member) => member.user_id);
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

        const enrichedMembers = (members ?? []).map((member) => ({
            ...member,
            role: normalizeRole(member.role),
            full_name: profilesById[member.user_id]?.full_name ?? null,
            avatar_url: profilesById[member.user_id]?.avatar_url ?? null
        }));

        return res.status(200).json({
            success: true,
            data: enrichedMembers,
            count: enrichedMembers.length
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
        const { user_id, email, role } = req.body;
        const addedBy = req.user.id;

        // Validation
        if (!user_id && !email?.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'User ID or email is required'
            });
        }


       
        const validRoles = Object.values(PROJECT_ROLES);
        const memberRole = normalizeRole(role || PROJECT_ROLES.MEMBER);

        if (!validRoles.includes(memberRole)) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Invalid role. Must be one of: OWNER, ADMIN, MEMBER, VIEWER'
            });
        }


        let resolvedUserId = user_id;

        if (!resolvedUserId && email?.trim()) {
            const { data: usersPage, error: userLookupError } = await supabase.auth.admin.listUsers();
            if (userLookupError) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to look up user',
                    message: userLookupError.message
                });
            }

            const matchedUser = usersPage.users.find((user) => user.email?.toLowerCase() === email.trim().toLowerCase());
            if (!matchedUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: 'No authenticated user exists with that email address'
                });
            }

            resolvedUserId = matchedUser.id;
        }

        // Check if user exists
        const { data: userExists, error: userCheckError } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('user_id', resolvedUserId)
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
            .eq('user_id', resolvedUserId)
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
                user_id: resolvedUserId,
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
            data: {
                ...member,
                role: normalizeRole(member.role)
            },
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

        const validRoles = Object.values(PROJECT_ROLES);
        const memberRole = normalizeRole(role);

        if (!validRoles.includes(memberRole)) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Invalid role. Must be one of: OWNER, ADMIN, MEMBER, VIEWER'
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
            .update({ role: memberRole })
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
            data: {
                ...member,
                role: normalizeRole(member.role)
            },
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
