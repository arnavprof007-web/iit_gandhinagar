import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate, updateProfileSchema } from '../middleware/validationMiddleware.js';
import profileService from '../services/profileService.js';

const router = Router();

/**
 * GET /api/v1/users/me
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: { user: profile },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/users/me
 */
router.patch('/me', requireAuth, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const updated = await profileService.updateProfile(req.user.id, req.body, { ipAddress: req.ip });
    res.status(200).json({
      success: true,
      data: { user: updated },
      message: 'Profile updated successfully.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/users/me/email - Request email update OTP
 */
router.post('/me/email', requireAuth, async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    const result = await profileService.requestEmailChange(req.user.id, newEmail);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/users/me/email/verify - Confirm email update with OTP
 */
router.post('/me/email/verify', requireAuth, async (req, res, next) => {
  try {
    const { newEmail, otp } = req.body;
    const result = await profileService.confirmEmailChange(req.user.id, newEmail, otp, { ipAddress: req.ip });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
