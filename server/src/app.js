import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Builds and returns the configured Express app without starting a listener,
// so it can be imported directly in tests.
export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigins }));
  app.use(express.json());
  if (config.env !== 'test') {
    app.use(morgan(config.isProd ? 'combined' : 'dev'));
  }

  // Trust the first proxy (load balancer) for correct client IPs.
  app.set('trust proxy', 1);

  app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
