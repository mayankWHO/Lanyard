import { supabase } from '../config/supabase.js';

//check if user has platform admin role (system-level admin)
export const requirePlatformAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to perform this action'
            });
        }

        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', req.user.id)
            .single();

        if (error || !profile) {
            return res.status(403).json({
                success: false,
                error: 'Profile not found',
                message: 'User profile could not be retrieved'
            });
        }

        //accept both old 'admin' and new 'platform_admin' for backward compatibility
        if (profile.role !== 'admin' && profile.role !== 'platform_admin') {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                message: 'This action requires platform admin privileges'
            });
        }

        req.userRole = profile.role;
        next();
    } catch (error) {
        console.error('Platform admin check error:', error);
        return res.status(500).json({
            success: false,
            error: 'Permission verification failed',
            message: 'An error occurred while verifying permissions'
        });
    }
};

//check if user is project owner or platform admin
export const requireProjectOwner = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to perform this action'
            });
        }

        const projectId = req.params.projectId;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                error: 'Missing project ID',
                message: 'Project ID is required'
            });
        }

        //check system role
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', req.user.id)
            .single();

        if (profileError || !profile) {
            return res.status(403).json({
                success: false,
                error: 'Profile not found',
                message: 'User profile could not be retrieved'
            });
        }

        //platform admin has access to all projects
        if (profile.role === 'admin' || profile.role === 'platform_admin') {
            req.userRole = 'platform_admin';
            req.projectRole = 'owner';
            return next();
        }

        //check if user is project owner
        const { data: member, error: memberError } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', req.user.id)
            .single();

        if (memberError || !member) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You do not have access to this project'
            });
        }

        
        if (member.role !== 'project_admin' && member.role !== 'owner') {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                message: 'This action requires project owner privileges'
            });
        }

        req.userRole = profile.role;
        req.projectRole = member.role;
        next();
    } catch (error) {
        console.error('Project owner check error:', error);
        return res.status(500).json({
            success: false,
            error: 'Permission verification failed',
            message: 'An error occurred while verifying permissions'
        });
    }
};

//check if user is a project member (can edit/create content)
export const requireProjectMember = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to perform this action'
            });
        }

        const projectId = req.params.projectId;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                error: 'Missing project ID',
                message: 'Project ID is required'
            });
        }

        // Check system role
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', req.user.id)
            .single();

        if (profileError || !profile) {
            return res.status(403).json({
                success: false,
                error: 'Profile not found',
                message: 'User profile could not be retrieved'
            });
        }

        // Platform admin has access to all projects
        if (profile.role === 'admin' || profile.role === 'platform_admin') {
            req.userRole = 'platform_admin';
            req.projectRole = 'owner';
            return next();
        }

        // Check if user is a member of this project
        const { data: member, error: memberError } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', req.user.id)
            .single();

        if (memberError || !member) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You do not have access to this project'
            });
        }

        // Members and owners can edit, but viewers cannot
        
        const editableRoles = ['owner', 'project_admin', 'member'];
        if (!editableRoles.includes(member.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                message: 'You need member or owner privileges to perform this action'
            });
        }

        req.userRole = profile.role;
        req.projectRole = member.role;
        next();
    } catch (error) {
        console.error('Project member check error:', error);
        return res.status(500).json({
            success: false,
            error: 'Permission verification failed',
            message: 'An error occurred while verifying permissions'
        });
    }
};

//check if user has any access to the project (including viewers)
export const requireProjectAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to perform this action'
            });
        }

        const projectId = req.params.projectId;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                error: 'Missing project ID',
                message: 'Project ID is required'
            });
        }

        // Check system role
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', req.user.id)
            .single();

        if (profileError || !profile) {
            return res.status(403).json({
                success: false,
                error: 'Profile not found',
                message: 'User profile could not be retrieved'
            });
        }

        // Platform admin has access to all projects
        if (profile.role === 'admin' || profile.role === 'platform_admin') {
            req.userRole = 'platform_admin';
            req.projectRole = 'owner';
            return next();
        }

        // Check if user is a member of this project (any role including viewer)
        const { data: member, error: memberError } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', req.user.id)
            .single();

        if (memberError || !member) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You do not have access to this project'
            });
        }

        req.userRole = profile.role;
        req.projectRole = member.role;
        next();
    } catch (error) {
        console.error('Project access check error:', error);
        return res.status(500).json({
            success: false,
            error: 'Permission verification failed',
            message: 'An error occurred while verifying permissions'
        });
    }
};

// handlers
export const requireAdmin = requirePlatformAdmin;
export const requireProjectAdmin = requireProjectOwner;
