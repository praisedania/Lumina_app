import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '1d',
  });
};
