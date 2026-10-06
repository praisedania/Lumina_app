import express from 'express';
import { protect, isInstructor } from '../middlewares/authMiddleware.js';
import { saveBankDetails, getEarningsStats } from '../controllers/instructorController.js';

const router = express.Router();

// POST /api/instructor/profile/bank-details
router.post('/profile/bank-details', protect, isInstructor, saveBankDetails);

// GET /api/instructor/dashboard/stats
router.get('/dashboard/stats', protect, isInstructor, getEarningsStats);

export default router;
