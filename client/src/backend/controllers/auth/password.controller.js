import { supabase, supabaseAdmin } from '../../config/supabase.js';

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Both old password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Weak password',
                message: 'New password must be at least 6 characters long'
            });
        }

        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: req.user.email,
            password: oldPassword
        });

        if (verifyError) {
            return res.status(401).json({
                success: false,
                error: 'Invalid old password',
                message: 'The old password you provided is incorrect'
            });
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            req.user.id,
            { password: newPassword }
        );

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                message: 'Failed to change password'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred while changing password'
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Missing email',
                message: 'Email address is required'
            });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                message: 'Failed to send password reset email'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred while processing password reset request'
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Reset token and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Weak password',
                message: 'Password must be at least 6 characters long'
            });
        }

        const { data: userData, error: userError } = await supabase.auth.getUser(resetToken);

        if (userError) {
            console.error('Token verification error:', userError);
            return res.status(400).json({
                success: false,
                error: userError.message,
                message: 'Invalid or expired reset token'
            });
        }

        if (!userData || !userData.user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token',
                message: 'Could not retrieve user from token'
            });
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userData.user.id,
            { password: newPassword }
        );

        if (error) {
            console.error('Password update error:', error);
            return res.status(400).json({
                success: false,
                error: error.message,
                message: 'Failed to reset password'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            data: {
                user: {
                    id: data.user.id,
                    email: data.user.email
                }
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred while resetting password'
        });
    }
};
