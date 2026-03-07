import { supabase } from '../../config/supabase.js';

export const verifyEmail = async (req, res) => {
    try {
        const { verificationToken } = req.params;
        const { type } = req.query;

        if (!verificationToken) {
            return res.status(400).json({
                success: false,
                error: 'Missing verification token',
                message: 'Verification token is required'
            });
        }

        const { data, error } = await supabase.auth.verifyOtp({
            token_hash: verificationToken,
            type: type || 'email'
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                message: 'Email verification failed. The link may be invalid or expired.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                user: data.user,
                session: data.session
            }
        });
    } catch (error) {
        console.error('Verify email error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred during email verification'
        });
    }
};

export const resendEmailVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            if (!req.user?.email) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing email',
                    message: 'Email address is required'
                });
            }
        }

        const emailToVerify = email || req.user.email;

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: emailToVerify,
            options: {
                emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify`
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                message: 'Failed to resend verification email'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred while resending verification email'
        });
    }
};
