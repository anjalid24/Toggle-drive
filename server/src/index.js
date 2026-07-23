import config from './config/index.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

async function start() {
  await connectDB();
  const app = createApp();

  const server = app.listen(config.port, () =>
    logger.info(`Toggle Drive API listening on port ${config.port}`)
  );

  // Graceful shutdown.
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down…`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error('Failed to start server:', err.message);
  process.exit(1);
});
