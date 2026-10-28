import { getSessionUser } from '../services/authService.js';
import config from '../config/env.js';

/**
 * Extract session token from HTTP-only cookie, Authorization header, or x-session-token
 */
export function extractSessionToken(req) {
  if (req.cookies && req.cookies[config.sessionCookieName]) {
    return req.cookies[config.sessionCookieName];
  }

  // Also parse raw cookie header if req.cookies is missing (e.g. In test runner)
  if (req.headers && req.headers['cookie']) {
    const rawCookies = req.headers['cookie'];
    const match = rawCookies.match(new RegExp(`(?:^|;\\s*)${config.sessionCookieName}=([^;]+)`));
    if (match) {
      return decodeURIComponent(match[1].trim());
    }
  }

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  if (req.headers['x-session-token']) {
    return req.headers['x-session-token'];
  }

  return null;
}

/**
 * Mandatory authentication middleware
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractSessionToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required. Please sign in.',
        },
      });
    }

    const user = await getSessionUser(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Your session has expired or is invalid. Please sign in again.',
        },
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated.',
        },
      });
    }

    // Mandatory first-login password change check
    const allowedPathsWithOldPassword = [
      '/api/v1/auth/change-password',
      '/api/v1/auth/me',
      '/api/v1/auth/logout',
    ];

    const currentPath = req.baseUrl + req.path;
    if (user.must_change_password && !allowedPathsWithOldPassword.some((p) => currentPath.endsWith(p) || req.originalUrl.includes(p))) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_REQUIRED',
          message: 'You must change your initial temporary password before accessing platform features.',
        },
      });
    }

    req.user = user;
    req.sessionToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication middleware (attaches req.user if authenticated, but doesn't block)
 */
export async function optionalAuth(req, _res, next) {
  try {
    const token = extractSessionToken(req);
    if (token) {
      const user = await getSessionUser(token);
      if (user && user.is_active) {
        req.user = user;
        req.sessionToken = token;
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
}

/**
 * Role-Based Access Control middleware
 * @param {'admin'|'user'} requiredRole
 */
export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required.',
        },
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. Administrator privileges required.',
        },
      });
    }

    next();
  };
}

export default {
  requireAuth,
  optionalAuth,
  requireRole,
  extractSessionToken,
};
