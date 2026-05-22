import express from 'express';
import { createCourse, getAllCourses, getCourseById, updateCourse, getPublicCourses } from '../controllers/courseController.js';
import { protect, isInstructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/home', getPublicCourses);
router.get('/public', getPublicCourses);

router.use(protect); // Applies to all routes below this point

router.post('/', isInstructor, createCourse);
router.patch('/:id', isInstructor, updateCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

export default router;
