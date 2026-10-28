import { AdminAnalytics, Challenge } from '../types';
import { INITIAL_ADMIN_ANALYTICS } from '../mocks/mockAdminData';
import { challengeService } from './challengeService';
import { getStoredItem, setStoredItem } from './storage';
import apiClient from './apiClient';

const ADMIN_KEY = 'admin_analytics_data';

export const adminService = {
  getAnalytics(): AdminAnalytics {
    return getStoredItem<AdminAnalytics>(ADMIN_KEY, INITIAL_ADMIN_ANALYTICS);
  },

  async getBackendChallenges(params?: { status?: string; category?: string; page?: number; limit?: number }) {
    return apiClient.get('/admin/challenges', params);
  },

  async createBackendChallenge(data: {
    title: string;
    description: string;
    category: string;
    instructions?: string[];
    startDate: string;
    endDate: string;
    targetType?: string;
    targetValue: number;
    targetUnit: string;
    proofType: string;
    verificationRules?: Record<string, any>;
    pointsReward: number;
    status?: 'draft' | 'published';
  }) {
    return apiClient.post('/admin/challenges', data);
  },

  async publishChallenge(id: string) {
    return apiClient.post(`/admin/challenges/${id}/publish`);
  },

  async closeChallenge(id: string) {
    return apiClient.post(`/admin/challenges/${id}/close`);
  },

  async getChallengeStats() {
    return apiClient.get('/admin/challenges/stats');
  },

  async getAuditLogs(params?: { limit?: number; offset?: number }) {
    return apiClient.get('/admin/audit-logs', params);
  },

  createChallenge(challengeData: Omit<Challenge, 'id' | 'completed' | 'progress'>): Challenge {
    const newChallenge: Challenge = {
      ...challengeData,
      id: `ch_admin_${Date.now()}`,
      completed: false,
      progress: 0,
    };
    const list = challengeService.getChallenges();
    list.unshift(newChallenge);
    setStoredItem('green_challenges', list);

    // Update active count
    const analytics = this.getAnalytics();
    analytics.activeChallenges += 1;
    setStoredItem(ADMIN_KEY, analytics);

    return newChallenge;
  },

  updateCampaignStatus(
    campaignId: string,
    status: 'active' | 'upcoming' | 'completed'
  ): void {
    const analytics = this.getAnalytics();
    const camp = analytics.campaigns.find((c) => c.id === campaignId);
    if (camp) {
      camp.status = status;
      setStoredItem(ADMIN_KEY, analytics);
    }
  },

  resolveModerationReport(reportId: string, status: 'resolved' | 'dismissed'): void {
    const analytics = this.getAnalytics();
    const rep = analytics.moderationReports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      setStoredItem(ADMIN_KEY, analytics);
    }
  },
};

export default adminService;
