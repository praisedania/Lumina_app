import rateLimit from 'express-rate-limit';

// Standard rate limiter for highly sensitive actions like registration and verification
// Default: 5 requests per hour (3600000 ms)
export const sensitiveEndpointLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 3600000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 5,
  statusCode: 429,
  message: {
    status: 'error',
    message: 'Too many requests, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for login
// Default: 10 requests per 15 minutes (900000 ms)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  statusCode: 429,
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
