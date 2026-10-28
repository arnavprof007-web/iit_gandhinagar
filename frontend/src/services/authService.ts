import { UserProfile } from '../types';
import { INITIAL_USER_PROFILE } from '../mocks/mockUserData';
import { getStoredItem, setStoredItem, removeStoredItem, resetAllDemoStorage } from './storage';
import apiClient from './apiClient';

const USER_STORAGE_KEY = 'user_profile';
const AUTH_STATUS_KEY = 'greenpulse_authenticated';

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile;
}

export function mapBackendUserToProfile(backendUser: any): UserProfile {
  if (!backendUser) return INITIAL_USER_PROFILE;

  return {
    id: backendUser.id || 'usr-1',
    name: backendUser.full_name || backendUser.fullName || backendUser.name || 'Citizen',
    email: backendUser.email || '',
    city: backendUser.city || 'Gandhinagar',
    state: backendUser.state || 'Gujarat',
    householdSize: backendUser.household_size || backendUser.householdSize || 4,
    homeType: 'apartment',
    electricityKwh: 240,
    monthlyBillInr: 1450,
    tariffInrPerKwh: 6.05,
    primaryTransport: (backendUser.primary_transport_mode as any) || 'public_transit',
    commuteDistanceKmDaily: 14,
    cookingFuel: 'piped_gas',
    dietType: (backendUser.diet_type as any) || 'vegetarian',
    greenScore: 78,
    greenPoints: 420,
    streakDays: 12,
    level: 3,
    personalGoalKwh: 200,
    personalGoalEmissionsKg: 180,
    joinedDate: backendUser.created_at
      ? new Date(backendUser.created_at).toISOString().split('T')[0]
      : '2026-01-15',
    badges: INITIAL_USER_PROFILE.badges,
    role: backendUser.role || 'user',
    emailVerified: backendUser.email_verified ?? true,
    mustChangePassword: backendUser.must_change_password ?? false,
  };
}

export const authService = {
  getCurrentUser(): UserProfile {
    return getStoredItem<UserProfile>(USER_STORAGE_KEY, INITIAL_USER_PROFILE);
  },

  isAuthenticated(): boolean {
    return getStoredItem<boolean>(AUTH_STATUS_KEY, false);
  },

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    city?: string;
    state?: string;
    householdSize?: number;
    dietType?: string;
    primaryTransportMode?: string;
  }) {
    const res = await apiClient.post('/auth/register', data);
    return res;
  },

  async verifyEmail(email: string, otp: string) {
    const res = await apiClient.post('/auth/verify-email', { email, otp });
    return res;
  },

  async resendOtp(email: string, purpose: string = 'registration') {
    const res = await apiClient.post('/auth/resend-otp', { email, purpose });
    return res;
  },

  async login(email: string, password: string): Promise<UserProfile> {
    const res = await apiClient.post('/auth/login', { email, password });
    const profile = mapBackendUserToProfile(res.data?.user);
    setStoredItem(USER_STORAGE_KEY, profile);
    setStoredItem(AUTH_STATUS_KEY, true);
    return profile;
  },

  async fetchCurrentUser(): Promise<UserProfile | null> {
    try {
      const res = await apiClient.get('/auth/me');
      if (res?.data?.user) {
        const profile = mapBackendUserToProfile(res.data.user);
        setStoredItem(USER_STORAGE_KEY, profile);
        setStoredItem(AUTH_STATUS_KEY, true);
        return profile;
      }
      return null;
    } catch {
      setStoredItem(AUTH_STATUS_KEY, false);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      removeStoredItem(USER_STORAGE_KEY);
      setStoredItem(AUTH_STATUS_KEY, false);
    }
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res;
  },

  async forgotPassword(email: string) {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await apiClient.post('/auth/reset-password', { token, newPassword });
    return res;
  },

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getCurrentUser();
    const updated: UserProfile = { ...current, ...updates };
    setStoredItem(USER_STORAGE_KEY, updated);

    // Sync allowlisted fields to backend if logged in
    if (this.isAuthenticated()) {
      apiClient.patch('/users/me', {
        fullName: updates.name,
        city: updates.city,
        state: updates.state,
        householdSize: updates.householdSize,
        dietType: updates.dietType,
        primaryTransportMode: updates.primaryTransport,
      }).catch(() => {});
    }

    return updated;
  },

  resetDemoData(): void {
    resetAllDemoStorage();
    setStoredItem(USER_STORAGE_KEY, INITIAL_USER_PROFILE);
    setStoredItem(AUTH_STATUS_KEY, false);
  },
};

export default authService;
