import jwt from 'jsonwebtoken';
import models from '../models/index.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);

      req.user = await models.User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Auth verification failed:', error);
      return res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ status: 'error', message: 'Not authorized as an admin' });
  }
};

export const isInstructor = (req, res, next) => {
  if (req.user && (req.user.role === 'instructor' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ status: 'error', message: 'Not authorized as an instructor' });
  }
};
