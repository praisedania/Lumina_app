import express from 'express';
import { registerUser, loginUser, switchToInstructor, verifyEmail, resendVerification } from '../controllers/authController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import { sensitiveEndpointLimiter, loginLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', sensitiveEndpointLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/verify', verifyEmail);
router.post('/verify', verifyEmail);
router.post('/resend-verification', sensitiveEndpointLimiter, resendVerification);

router.patch('/switch-to-instructor', protect, switchToInstructor);
export default router;
