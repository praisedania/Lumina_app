import express from 'express';
import courseRoutes from './courseRoutes.js';
import lessonRoutes from './lessonRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import enrollmentRoutes from './enrollmentRoutes.js';
import chatRoutes from './chatRoutes.js';
import instructorRoutes from './instructorRoutes.js';
import paymentRoutes from './paymentRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/enroll', enrollmentRoutes);
router.use('/chat', chatRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/instructor', instructorRoutes);
router.use('/payments', paymentRoutes);

export default router;
