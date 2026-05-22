import models from '../models/index.js';
import jwt from 'jsonwebtoken';

export const createCourse = async (req, res) => {
  try {
    const instructor_id = req.user.id;
    const { title, description, category, thumbnail_url, price, currency } = req.body;
    
    if (!title) {
      return res.status(400).json({ status: 'error', message: 'title is required' });
    }

    const newCourse = await models.Course.create({
      instructor_id,
      title,
      description,
      category,
      thumbnail_url,
      price: price !== undefined ? parseFloat(price) : 0.00,
      currency: currency || 'NGN'
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
    const { title, description, category, thumbnail_url, price, currency } = req.body;

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
    if (price !== undefined) course.price = parseFloat(price);
    if (currency !== undefined) course.currency = currency;

    await course.save();

    res.status(200).json({ status: 'success', data: course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const getPublicCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { category, search, minPrice, maxPrice, sortBy, sortOrder } = req.query;

    const where = {};

    // Filter by Category
    if (category) {
      where.category = category;
    }

    // Filter by Search Query (Case-insensitive matching title or description)
    if (search) {
      const { Op } = models.Sequelize;
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by Price Bounds
    if (minPrice !== undefined || maxPrice !== undefined) {
      const { Op } = models.Sequelize;
      where.price = {};
      if (minPrice !== undefined) {
        where.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    // Sorting
    const validSortFields = ['createdAt', 'price', 'title', 'category'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await models.Course.findAndCountAll({
      where,
      include: [
        { model: models.User, as: 'Instructor', attributes: ['id', 'name', 'email'] }
      ],
      limit,
      offset,
      order: [[orderField, orderDirection]]
    });

    // Optional user context: Find enrollment course IDs if a token is passed
    let enrolledCourseIds = [];
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'fallback_secret_key';
        const decoded = jwt.verify(token, secret);
        
        if (decoded && decoded.id) {
          const enrollments = await models.Enrollment.findAll({
            where: { user_id: decoded.id },
            attributes: ['course_id']
          });
          enrolledCourseIds = enrollments.map(e => e.course_id);
        }
      } catch (err) {
        console.log('Optional home page token authentication failed:', err.message);
      }
    }

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      status: 'success',
      data: {
        courses: rows,
        enrolledCourseIds,
        pagination: {
          totalCourses: count,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching public courses:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
