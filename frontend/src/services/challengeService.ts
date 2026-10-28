import { Challenge } from '../types';
import { INITIAL_CHALLENGES } from '../mocks/mockChallenges';
import { getStoredItem, setStoredItem } from './storage';
import apiClient from './apiClient';
import authService from './authService';

const CHALLENGES_KEY = 'green_challenges';

function mapBackendChallenge(c: any): Challenge {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: (c.category || 'energy') as any,
    cadence: 'weekly',
    difficulty: c.points_reward > 100 ? 'hard' : c.points_reward > 50 ? 'medium' : 'easy',
    points: c.points_reward,
    co2AvoidedKg: Number(c.target_value) * 1.5,
    completed: c.is_joined || false,
    progress: c.is_joined ? Number(c.target_value) : 0,
    target: Number(c.target_value),
    unit: c.target_unit || 'units',
    instructions: Array.isArray(c.instructions) ? c.instructions : [c.instructions || 'Follow instructions'],
    tips: ['Keep your evidence receipts or photos ready for verification'],
  };
}

export const challengeService = {
  getChallenges(): Challenge[] {
    return getStoredItem<Challenge[]>(CHALLENGES_KEY, INITIAL_CHALLENGES);
  },

  getChallengeById(id: string): Challenge | undefined {
    return this.getChallenges().find((c) => c.id === id);
  },

  /**
   * Fetch active challenges from PostgreSQL backend
   */
  async fetchChallenges(category?: string, search?: string): Promise<Challenge[]> {
    try {
      const params: Record<string, string> = {};
      if (category && category !== 'all') params.category = category;
      if (search && search.trim()) params.search = search.trim();

      const res = await apiClient.get('/challenges', params);
      if (res?.data?.challenges && Array.isArray(res.data.challenges)) {
        const mapped = res.data.challenges.map(mapBackendChallenge);
        if (mapped.length > 0) {
          setStoredItem(CHALLENGES_KEY, mapped);
          return mapped;
        }
      }
      return this.getChallenges();
    } catch {
      // Fallback to locally stored or initial challenges if backend query fails
      return this.getChallenges();
    }
  },

  /**
   * Enroll / Join a challenge in the database
   * NOTE: Per Phase 5 specification, joining a challenge NEVER awards points!
   */
  async joinChallenge(id: string): Promise<{ success: boolean; message: string; challenge?: Challenge }> {
    try {
      const res = await apiClient.post(`/challenges/${id}/join`);
      const list = this.getChallenges();
      const updatedList = list.map((c) => (c.id === id ? { ...c, completed: true } : c));
      setStoredItem(CHALLENGES_KEY, updatedList);

      return {
        success: true,
        message: res.message || 'Successfully enrolled in challenge. Zero points awarded upon join.',
        challenge: updatedList.find((c) => c.id === id),
      };
    } catch (err: any) {
      if (err.code === 'DUPLICATE_ENROLLMENT') {
        return {
          success: false,
          message: 'You are already enrolled in this challenge.',
        };
      }
      return {
        success: false,
        message: err.message || 'Failed to enroll in challenge.',
      };
    }
  },

  /**
   * Complete challenge mock action
   */
  completeChallenge(id: string): { success: boolean; message: string; pointsAwarded: number; challenge?: Challenge } {
    const list = this.getChallenges();
    const index = list.findIndex((c) => c.id === id);

    if (index === -1) {
      return { success: false, message: 'Challenge not found', pointsAwarded: 0 };
    }

    const currentChallenge = list[index];
    if (currentChallenge.completed) {
      return {
        success: false,
        message: 'This challenge has already been enrolled or completed.',
        pointsAwarded: 0,
        challenge: currentChallenge,
      };
    }

    const pointsToAward = currentChallenge.points;
    const updatedChallenge: Challenge = {
      ...currentChallenge,
      completed: true,
      completedAt: new Date().toISOString(),
      progress: currentChallenge.target,
    };

    const updatedList = [...list];
    updatedList[index] = updatedChallenge;
    setStoredItem(CHALLENGES_KEY, updatedList);

    // Update user profile points
    const user = authService.getCurrentUser();
    const newPoints = user.greenPoints + pointsToAward;
    authService.updateUserProfile({ greenPoints: newPoints });

    return {
      success: true,
      message: `Completed "${currentChallenge.title}"! Earned ${pointsToAward} Green Points.`,
      pointsAwarded: pointsToAward,
      challenge: updatedChallenge,
    };
  },
};

export default challengeService;
