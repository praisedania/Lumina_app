import express from 'express';
import { registerUser, loginUser, switchToInstructor } from '../controllers/authController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.patch('/switch-to-instructor', protect, switchToInstructor);
export default router;
