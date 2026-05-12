import express from 'express';
import { 
  createInitialAdmin,
  adminLogin,
  getSystemStats, 
  getAllUsers, 
  deleteUser, 
  getAllCourses, 
  deleteCourse,
  makeAdmin 
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes for initial setup and login
router.post('/setup', createInitialAdmin);
router.post('/login', adminLogin);

// Protected routes - All routes below require admin role
router.use(protect);
router.use(isAdmin);

router.get('/stats', getSystemStats);

router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);

router.get('/courses', getAllCourses);
router.delete('/courses/:courseId', deleteCourse);

router.patch('/make-admin/:userId', makeAdmin);

export default router;
