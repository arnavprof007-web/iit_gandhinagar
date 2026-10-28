import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { healthCheck as dbHealthCheck } from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const createApp = () => {
  const app = express();

  // Security and utility middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic API Health Check Route
  app.get('/api/health', async (_req, res) => {
    const dbStatus = await dbHealthCheck();
    res.status(200).json({
      status: 'ok',
      service: 'greenpulse-backend',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
    });
  });

  // REST API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/challenges', challengeRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404 Route Handler
  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'API route not found',
      },
    });
  });

  // Global Error Handler
  app.use((err, _req, res, _next) => {
    void _next;
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    const code = err.code || 'INTERNAL_SERVER_ERROR';

    if (status >= 500) {
      console.error('[Unhandled Server Error]:', err);
    }

    res.status(status).json({
      success: false,
      error: {
        code,
        message,
        fields: err.fields || undefined,
      },
    });
  });

  return app;
};

export default createApp;
