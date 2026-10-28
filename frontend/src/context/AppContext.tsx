import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, NotificationItem } from '../types';
import { authService } from '../services/authService';
import { INITIAL_NOTIFICATIONS } from '../mocks/mockNotifications';
import { getStoredItem, setStoredItem } from '../services/storage';

interface AppContextValue {
  user: UserProfile;
  isAuthenticated: boolean;
  refreshUser: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetAllDemo: () => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const NOTIFS_KEY = 'user_notifications';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStoredItem<NotificationItem[]>(NOTIFS_KEY, INITIAL_NOTIFICATIONS)
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const refreshUser = useCallback(() => {
    setUser(authService.getCurrentUser());
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    const updated = authService.updateUserProfile(updates);
    setUser(updated);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(authService.getCurrentUser());
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    // Authoritatively restore server session on startup
    authService.fetchCurrentUser().then((profile) => {
      if (profile) {
        setUser(profile);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      setStoredItem(NOTIFS_KEY, updated);
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      setStoredItem(NOTIFS_KEY, updated);
      return updated;
    });
  }, []);

  const resetAllDemo = useCallback(() => {
    authService.logout();
    setUser(authService.getCurrentUser());
    setIsAuthenticated(false);
    setNotifications(INITIAL_NOTIFICATIONS);
    setStoredItem(NOTIFS_KEY, INITIAL_NOTIFICATIONS);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        refreshUser,
        updateUser,
        logout,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetAllDemo,
        isMobileNavOpen,
        setIsMobileNavOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
