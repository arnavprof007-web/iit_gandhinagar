import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[GreenPulse Backend] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.log(`[GreenPulse Backend] Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('[GreenPulse Backend] Graceful shutdown initiated...');
  server.close(() => {
    console.log('[GreenPulse Backend] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
