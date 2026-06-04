import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import models from '../models/index.js';
import { generateToken } from '../utils/authUtils.js';
import { sendVerificationEmail } from '../utils/emailService.js';

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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await models.User.create({
      name,
      email,
      password_hash,
      role: finalRole,
      isVerified: false,
      verificationToken
    });

    // Send the verification email asynchronously
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please verify your email address.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationToken: user.verificationToken // Returned for development/testing convenience
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
      // Check verification status
      if (!user.isVerified) {
        return res.status(403).json({
          status: 'error',
          message: 'Please verify your email address before logging in.'
        });
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

export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({ status: 'error', message: 'Verification token is required' });
    }

    const user = await models.User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. You can now log in.',
      data: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ status: 'error', message: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(200).json({
      status: 'success',
      message: 'Verification email resent successfully.',
      data: {
        email: user.email,
        verificationToken // Return token for development/testing convenience
      }
    });
  } catch (error) {
    console.error('Error resending verification:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
