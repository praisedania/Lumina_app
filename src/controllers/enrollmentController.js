import models from '../models/index.js';

/**
 * @desc    Enroll in a course
 * @route   POST /api/enroll/:courseId
 * @access  Private
 */
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // 1. Check if course exists
    const course = await models.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    // 2. Check if already enrolled
    const existingEnrollment = await models.Enrollment.findOne({
      where: { user_id: userId, course_id: courseId }
    });

    if (existingEnrollment) {
      return res.status(400).json({ status: 'error', message: 'Already enrolled in this course' });
    }

    // 3. Create enrollment
    const enrollment = await models.Enrollment.create({
      user_id: userId,
      course_id: courseId,
      completed_lesson_ids: []
    });

    res.status(201).json({
      status: 'success',
      message: 'Successfully enrolled in course',
      data: enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Toggle lesson progress (complete/incomplete)
 * @route   PATCH /api/progress/:lessonId
 * @access  Private
 */
export const toggleLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    // 1. Find the lesson to get the courseId
    const lesson = await models.Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ status: 'error', message: 'Lesson not found' });
    }

    // 2. Find the user's enrollment for this course
    const enrollment = await models.Enrollment.findOne({
      where: { user_id: userId, course_id: lesson.course_id }
    });

    if (!enrollment) {
      return res.status(403).json({ status: 'error', message: 'You must be enrolled in the course to track progress' });
    }

    // 3. Toggle progress
    let completedIds = [...enrollment.completed_lesson_ids];
    const index = completedIds.indexOf(lessonId);

    if (index > -1) {
      // Remove if already present (mark as incomplete)
      completedIds.splice(index, 1);
    } else {
      // Add if not present (mark as complete)
      completedIds.push(lessonId);
    }

    enrollment.completed_lesson_ids = completedIds;
    await enrollment.save();

    // Calculate progress percentage
    const totalLessons = await models.Lesson.count({ where: { course_id: lesson.course_id } });
    const progress = totalLessons > 0 ? (completedIds.length / totalLessons) * 100 : 0;

    res.status(200).json({
      status: 'success',
      message: index > -1 ? 'Lesson marked as incomplete' : 'Lesson marked as complete',
      data: {
        completed_lesson_ids: enrollment.completed_lesson_ids,
        progress: Math.round(progress)
      }
    });
  } catch (error) {
    console.error('Error toggling progress:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get current user's enrollments
 * @route   GET /api/enroll/my
 * @access  Private
 */
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await models.Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: models.Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail_url']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
