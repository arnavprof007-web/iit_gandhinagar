import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import challengeService from '../services/challengeService.js';

const router = Router();

/**
 * GET /api/v1/challenges - Public challenge discovery (only published challenges)
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category, search, limit, offset } = req.query;
    const result = await challengeService.getPublicChallenges({
      category,
      search,
      limit,
      offset,
      userId: req.user?.id,
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
 * GET /api/v1/challenges/my/participations - Current user's joined challenges history
 */
router.get('/my/participations', requireAuth, async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const result = await challengeService.getUserParticipations(req.user.id, { limit, offset });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/challenges/:id - Challenge details
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const challenge = await challengeService.getChallengeById(req.params.id, req.user?.id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { code: 'CHALLENGE_NOT_FOUND', message: 'Challenge not found.' },
      });
    }

    // Public users cannot see draft challenges unless they are administrators
    if (challenge.status === 'draft' && req.user?.role !== 'admin') {
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
 * POST /api/v1/challenges/:id/join - Enroll in a challenge
 * NOTE: Joining a challenge NEVER awards points!
 */
router.post('/:id/join', requireAuth, async (req, res, next) => {
  try {
    const result = await challengeService.joinChallenge(req.params.id, req.user.id);
    res.status(201).json({
      success: true,
      data: result.participant,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
