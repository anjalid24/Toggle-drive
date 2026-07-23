import mongoose from 'mongoose';
import config from './index.js';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  logger.info('MongoDB connected');
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
