import rateLimit from 'express-rate-limit';

/**
 * Standard JSON error response for rate limiter
 */
const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message,
    },
  });
};

// Strict limiter for authentication and registration endpoints (e.g. max 15 requests per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many authentication attempts. Please try again after 15 minutes.'),
  skip: () => process.env.NODE_ENV === 'test', // Skip in tests for fast automated execution
});

// Resend OTP limiter (max 5 per 15 minutes per IP)
export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many verification codes requested. Please try again after 15 minutes.'),
  skip: () => process.env.NODE_ENV === 'test',
});

// General public API limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Rate limit exceeded. Please slow down your requests.'),
  skip: () => process.env.NODE_ENV === 'test',
});

export default {
  authLimiter,
  resendOtpLimiter,
  generalLimiter,
};
