import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import models from '../models/index.js';
import { generateToken } from '../utils/authUtils.js';


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and password are required' });
    }

    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Prevent self-assigning admin role
    const finalRole = (role === 'admin') ? 'student' : (role || 'student');

    const user = await models.User.create({
      name,
      email,
      password_hash,
      role: finalRole
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      }
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const user = await models.User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
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
    console.error('Error during login:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const switchToInstructor = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    user.role = 'instructor';
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Successfully switched to instructor',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error switching to instructor:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};


