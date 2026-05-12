import models from '../models/index.js';

export const createCourse = async (req, res) => {
  try {
    const instructor_id = req.user.id;
    const { title, description, category, thumbnail_url } = req.body;
    
    if (!title) {
      return res.status(400).json({ status: 'error', message: 'title is required' });
    }

    const newCourse = await models.Course.create({
      instructor_id,
      title,
      description,
      category,
      thumbnail_url
    });

    // Create a chat room for this course
    await models.Conversation.create({
      type: 'room',
      course_id: newCourse.id,
      participants: [] // For rooms, enrollment check handles access, but we can track active participants here if needed
    });

    res.status(201).json({ status: 'success', data: newCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await models.Course.findAll({
      include: [
        { model: models.User, as: 'Instructor', attributes: ['id', 'name', 'email'] }
      ]
    });
    res.status(200).json({ status: 'success', data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await models.Course.findByPk(id, {
      include: [
        { model: models.User, as: 'Instructor', attributes: ['id', 'name', 'email'] },
        { model: models.Lesson, as: 'lessons', attributes: ['id', 'title', 'order_index'] }
      ],
      order: [
        [{ model: models.Lesson, as: 'lessons' }, 'order_index', 'ASC']
      ]
    });

    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    res.status(200).json({ status: 'success', data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, thumbnail_url } = req.body;

    const course = await models.Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to edit this course' });
    }

    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (thumbnail_url !== undefined) course.thumbnail_url = thumbnail_url;

    await course.save();

    res.status(200).json({ status: 'success', data: course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
