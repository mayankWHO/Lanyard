import { supabase } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Missing or invalid authorization header',
                message: 'Please provide a valid access token in the Authorization header'
            });
        }

        const token = authHeader.substring(7);

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                message: 'Please login again to get a new access token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication verification failed',
            message: 'An error occurred while verifying your credentials'
        });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user } } = await supabase.auth.getUser(token);

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        next();
    }
};
