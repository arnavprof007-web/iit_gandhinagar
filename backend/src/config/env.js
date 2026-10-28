import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Sessions & Auth
  sessionSecret: process.env.SESSION_SECRET || 'mission-life-dev-session-secret-at-least-32-chars-long',
  sessionCookieName: 'greenpulse_session',
  sessionExpiryDays: parseInt(process.env.SESSION_EXPIRY_DAYS || '7', 10),
  
  // OTP Rules
  otpLifetimeMinutes: parseInt(process.env.OTP_LIFETIME_MINUTES || '10', 10),
  otpMaxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
  otpResendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10),
  
  // Email Configuration
  emailProvider: process.env.EMAIL_PROVIDER || 'smtp',
  emailHost: process.env.EMAIL_HOST || 'localhost',
  emailPort: parseInt(process.env.EMAIL_PORT || '587', 10),
  emailSecure: process.env.EMAIL_SECURE === 'true',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  emailFrom: process.env.EMAIL_FROM || '"GreenPulse Mission LiFE" <no-reply@greenpulse.gov.in>',

  // Admin Bootstrap Credentials
  adminName: process.env.ADMIN_NAME,
  adminEmail: process.env.ADMIN_EMAIL,
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD,
};

export default config;
