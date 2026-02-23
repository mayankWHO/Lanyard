import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
    register,
    login,
    logout,
    getCurrentUser,
    changePassword,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    verifyToken
} from '../controllers/auth/index.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Protected routes
router.post('/logout', requireAuth, logout);
router.get('/verify', requireAuth, verifyToken);
router.get('/current-user', requireAuth, getCurrentUser);
router.post('/change-password', requireAuth, changePassword);
router.post('/resend-email-verification', requireAuth, resendEmailVerification);

export default router;
