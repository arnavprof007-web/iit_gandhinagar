import { Router } from 'express';
import authService from '../services/authService.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter, resendOtpLimiter } from '../middleware/rateLimiter.js';
import {
  validate,
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../middleware/validationMiddleware.js';
import config from '../config/env.js';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax',
  maxAge: config.sessionExpiryDays * 24 * 60 * 60 * 1000,
  path: '/',
};

/**
 * POST /api/v1/auth/register
 */
router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/verify-email
 */
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body.email, req.body.otp);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/resend-otp
 */
router.post('/resend-otp', resendOtpLimiter, validate(resendOtpSchema), async (req, res, next) => {
  try {
    const result = await authService.resendOtp(req.body.email, req.body.purpose);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/login
 */
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { sessionToken, user } = await authService.loginUser(req.body.email, req.body.password, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Set secure HTTP-only session cookie
    res.cookie(config.sessionCookieName, sessionToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      data: {
        user,
        sessionToken, // Included so clients without cookie access can send Bearer token
      },
    });
  } catch (err) {
    next(err);
  }
});

const { maxAge, ...CLEAR_COOKIE_OPTIONS } = COOKIE_OPTIONS;

/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await authService.logoutUser(req.sessionToken);
    res.clearCookie(config.sessionCookieName, CLEAR_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/auth/me
 */
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

/**
 * POST /api/v1/auth/forgot-password
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/reset-password
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/change-password
 */
router.post('/change-password', requireAuth, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword,
      { ipAddress: req.ip }
    );
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
