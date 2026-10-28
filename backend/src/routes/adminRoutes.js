import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  validate,
  createChallengeSchema,
  updateChallengeSchema,
} from '../middleware/validationMiddleware.js';
import challengeService from '../services/challengeService.js';
import { getAuditLogs } from '../services/auditService.js';

const router = Router();

// Apply mandatory Administrator authorization across all admin routes
router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * GET /api/v1/admin/challenges/stats - Aggregate stats for admin dashboard
 */
router.get('/challenges/stats', async (_req, res, next) => {
  try {
    const stats = await challengeService.getAdminChallengeStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/challenges - List all challenges with admin filters
 */
router.get('/challenges', async (req, res, next) => {
  try {
    const { category, status, search, limit, offset } = req.query;
    const result = await challengeService.getAdminChallenges({
      category,
      status,
      search,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/challenges - Create new challenge (draft by default)
 */
router.post('/challenges', validate(createChallengeSchema), async (req, res, next) => {
  try {
    const challenge = await challengeService.createChallenge(req.body, req.user, { ipAddress: req.ip });
    res.status(201).json({
      success: true,
      data: { challenge },
      message: 'Challenge created successfully.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/challenges/:id - Admin view of challenge details
 */
router.get('/challenges/:id', async (req, res, next) => {
  try {
    const challenge = await challengeService.getChallengeById(req.params.id, req.user.id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { code: 'CHALLENGE_NOT_FOUND', message: 'Challenge not found.' },
      });
    }

    res.status(200).json({
      success: true,
      data: { challenge },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/challenges/:id - Edit challenge (increments version if already published)
 */
router.patch('/challenges/:id', validate(updateChallengeSchema), async (req, res, next) => {
  try {
    const updated = await challengeService.editChallenge(req.params.id, req.body, req.user, { ipAddress: req.ip });
    res.status(200).json({
      success: true,
      data: { challenge: updated },
      message: 'Challenge updated successfully.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/challenges/:id/publish - Transition draft -> published
 */
router.post('/challenges/:id/publish', async (req, res, next) => {
  try {
    const published = await challengeService.transitionChallengeStatus(
      req.params.id,
      'published',
      req.user,
      { ipAddress: req.ip }
    );
    res.status(200).json({
      success: true,
      data: { challenge: published },
      message: 'Challenge published successfully and is now active for citizen participation.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/challenges/:id/close - Transition published -> closed
 */
router.post('/challenges/:id/close', async (req, res, next) => {
  try {
    const closed = await challengeService.transitionChallengeStatus(
      req.params.id,
      'closed',
      req.user,
      { ipAddress: req.ip }
    );
    res.status(200).json({
      success: true,
      data: { challenge: closed },
      message: 'Challenge closed. No new participations are permitted.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/challenges/:id/archive - Transition -> archived
 */
router.post('/challenges/:id/archive', async (req, res, next) => {
  try {
    const archived = await challengeService.transitionChallengeStatus(
      req.params.id,
      'archived',
      req.user,
      { ipAddress: req.ip }
    );
    res.status(200).json({
      success: true,
      data: { challenge: archived },
      message: 'Challenge archived.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/audit-logs - Query persistent administrative audit logs
 */
router.get('/audit-logs', async (req, res, next) => {
  try {
    const { action, entityType, limit, offset } = req.query;
    const result = await getAuditLogs({
      action,
      entityType,
      limit: parseInt(limit || '50', 10),
      offset: parseInt(offset || '0', 10),
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
