import bcrypt from 'bcrypt';
import models from '../models/index.js';
import { generateToken } from '../utils/authUtils.js';

/**
 * @desc    Create the very first admin (System Setup)
 * @route   POST /api/admin/setup
 * @access  Public (Requires secret key)
 */
export const createInitialAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json({ status: 'error', message: 'All fields and adminSecret are required' });
    }

    // 1. Verify the secret key from environment variables
    const systemSecret = process.env.ADMIN_SECRET_KEY || 'lumina_super_secret_2024'; 
    if (adminSecret !== systemSecret) {
      return res.status(401).json({ status: 'error', message: 'Invalid admin secret key' });
    }

    // 2. Check if user already exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    // 3. Create the admin user
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await models.User.create({
      name,
      email,
      password_hash,
      role: 'admin'
    });

    res.status(201).json({
      status: 'success',
      message: 'Initial admin created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    console.error('Error creating initial admin:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const user = await models.User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // Check if user is an admin
      if (user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Access denied. Only admins can log in here.' });
      }

      res.status(200).json({
        status: 'success',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id)
        }
      });
    } else {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get system-wide stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getSystemStats = async (req, res) => {
  try {
    const userCount = await models.User.count();
    const courseCount = await models.Course.count();
    const lessonCount = await models.Lesson.count();

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers: userCount,
        totalCourses: courseCount,
        totalLessons: lessonCount
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await models.User.findAll({
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:userId
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await models.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Don't allow admin to delete themselves via this route for safety
    if (user.id === req.user.id) {
      return res.status(400).json({ status: 'error', message: 'Cannot delete yourself' });
    }

    await user.destroy();

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get all courses
 * @route   GET /api/admin/courses
 * @access  Private/Admin
 */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await models.Course.findAll({
      include: [
        {
          model: models.User,
          as: 'instructor',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @desc    Delete a course
 * @route   DELETE /api/admin/courses/:courseId
 * @access  Private/Admin
 */
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await models.Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    await course.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
  }
};

/**
 * @desc    Promote a user to admin
 * @route   PATCH /api/admin/make-admin/:userId
 * @access  Private/Admin
 */
export const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await models.User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.role = 'admin';
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User successfully promoted to admin',
      data: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
