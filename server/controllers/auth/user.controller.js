import { supabase } from '../../config/supabase.js';

export const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve user information'
        });
    }
};

export const verifyToken = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to verify token'
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({
                success: false,
                error: 'Missing refresh token',
                message: 'Refresh token is required'
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: error.message,
                message: 'Invalid or expired refresh token'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                session: data.session,
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred while refreshing token'
        });
    }
};
