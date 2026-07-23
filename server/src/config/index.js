import 'dotenv/config';

// Centralised, validated configuration. Import this instead of reading
// process.env directly elsewhere so the app has a single source of truth.

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim()),

  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/toggledrive',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    dir: process.env.STORAGE_DIR || './storage',
    publicApiUrl: process.env.PUBLIC_API_URL || '',
  },

  limits: {
    defaultQuota: Number(process.env.DEFAULT_STORAGE_QUOTA) || 5 * 1024 * 1024 * 1024,
    maxUploadSize: Number(process.env.MAX_UPLOAD_SIZE) || 100 * 1024 * 1024,
  },
};

// In production a real secret must be supplied.
if (config.isProd && config.jwt.secret === 'dev-insecure-secret-change-me') {
  required('JWT_SECRET');
}

export default config;
