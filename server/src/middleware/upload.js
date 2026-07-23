import multer from 'multer';
import config from '../config/index.js';

// In-memory upload so the storage provider controls where bytes ultimately go.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.limits.maxUploadSize },
});
