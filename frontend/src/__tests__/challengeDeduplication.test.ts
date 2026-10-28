import { describe, it, expect, beforeEach } from 'vitest';
import { challengeService } from '../services/challengeService';
import { authService } from '../services/authService';

describe('Challenge Gamification & Duplicate Prevention', () => {
  beforeEach(() => {
    authService.resetDemoData();
  });

  it('completes an uncompleted challenge and awards points', () => {
    const challenges = challengeService.getChallenges();
    const uncompleted = challenges.find((c) => !c.completed);
    expect(uncompleted).toBeDefined();

    if (uncompleted) {
      const initialPoints = authService.getCurrentUser().greenPoints;
      const res = challengeService.completeChallenge(uncompleted.id);

      expect(res.success).toBe(true);
      expect(res.pointsAwarded).toBe(uncompleted.points);

      const updatedUser = authService.getCurrentUser();
      expect(updatedUser.greenPoints).toBe(initialPoints + uncompleted.points);
    }
  });

  it('strictly prevents duplicate reward claims for repeatedly completing a challenge', () => {
    const challenges = challengeService.getChallenges();
    const uncompleted = challenges.find((c) => !c.completed);
    expect(uncompleted).toBeDefined();

    if (uncompleted) {
      // First completion -> success
      const firstAttempt = challengeService.completeChallenge(uncompleted.id);
      expect(firstAttempt.success).toBe(true);
      expect(firstAttempt.pointsAwarded).toBe(uncompleted.points);

      const pointsAfterFirst = authService.getCurrentUser().greenPoints;

      // Second attempt on same challenge -> MUST reject duplicate points
      const secondAttempt = challengeService.completeChallenge(uncompleted.id);
      expect(secondAttempt.success).toBe(false);
      expect(secondAttempt.pointsAwarded).toBe(0);

      // Points must not have increased
      const pointsAfterSecond = authService.getCurrentUser().greenPoints;
      expect(pointsAfterSecond).toBe(pointsAfterFirst);

      // Third attempt -> still rejects
      const thirdAttempt = challengeService.completeChallenge(uncompleted.id);
      expect(thirdAttempt.success).toBe(false);
      expect(thirdAttempt.pointsAwarded).toBe(0);
      expect(authService.getCurrentUser().greenPoints).toBe(pointsAfterFirst);
    }
  });
});
