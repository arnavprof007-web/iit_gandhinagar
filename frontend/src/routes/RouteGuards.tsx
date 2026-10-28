import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Route guard requiring an active, authenticated session.
 * Redirects unauthenticated users to /login.
 */
export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useApp();
  const location = useLocation();

  if (!isAuthenticated && !user?.email) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Route guard requiring authoritative administrator role.
 * Regular citizens trying to access /admin are safely redirected to /dashboard.
 */
export const AdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useApp();
  const location = useLocation();

  if (!isAuthenticated && !user?.email) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
