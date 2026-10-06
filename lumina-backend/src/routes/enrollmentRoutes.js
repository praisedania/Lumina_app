import express from 'express';
import { enrollInCourse, toggleLessonProgress, getMyEnrollments } from '../controllers/enrollmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/:courseId', enrollInCourse);
router.patch('/progress/:lessonId', toggleLessonProgress);
router.get('/my', getMyEnrollments);

export default router;
