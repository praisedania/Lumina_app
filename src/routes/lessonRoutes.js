import express from 'express';
import { createLesson, getCourseLessons, updateLesson } from '../controllers/lessonController.js';
import { protect, isInstructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Applies to all routes below this point

router.post('/', isInstructor, createLesson);
router.patch('/:id', isInstructor, updateLesson);
router.get('/course/:courseId', getCourseLessons);

export default router;
