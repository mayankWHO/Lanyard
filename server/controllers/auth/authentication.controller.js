import { supabase } from '../../config/supabase.js';

export const register = async (req, res) => {
    try {
        const { email, password, metadata } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Weak password',
                message: 'Password must be at least 6 characters long'
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata || {},
                emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify`
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                message: 'Failed to register user'
            });
        }

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            data: {
                user: data.user,
                session: data.session
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred during registration'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Missing credentials',
                message: 'Email and password are required'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: error.message,
                message: 'Invalid credentials'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: data.user,
                session: data.session,
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred during login'
        });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.substring(7);

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'No token provided',
                message: 'Access token is required for logout'
            });
        }

        const { error } = await supabase.auth.admin.signOut(token);

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                message: 'Failed to logout'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred during logout'
        });
    }
};
