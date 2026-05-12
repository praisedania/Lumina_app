import models from '../models/index.js';

export const createLesson = async (req, res) => {
  try {
    const { course_id, title, content, video_url, order_index } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ status: 'error', message: 'course_id and title are required' });
    }

    const course = await models.Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to add lessons to this course' });
    }

    const newLesson = await models.Lesson.create({
      course_id,
      title,
      content,
      video_url,
      order_index: order_index || 0
    });

    res.status(201).json({ status: 'success', data: newLesson });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const lessons = await models.Lesson.findAll({
      where: { course_id: courseId },
      order: [['order_index', 'ASC']]
    });

    res.status(200).json({ status: 'success', data: lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, video_url, order_index } = req.body;

    const lesson = await models.Lesson.findByPk(id, {
      include: [{ model: models.Course, as: 'Course' }]
    });

    if (!lesson) {
      return res.status(404).json({ status: 'error', message: 'Lesson not found' });
    }

    const course = await models.Course.findByPk(lesson.course_id);

    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to edit this lesson' });
    }

    if (title) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (video_url !== undefined) lesson.video_url = video_url;
    if (order_index !== undefined) lesson.order_index = order_index;

    await lesson.save();

    res.status(200).json({ status: 'success', data: lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
