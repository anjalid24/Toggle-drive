import { Router } from 'express';
import { fileController } from '../controllers/fileController.js';
import { validate } from '../middleware/validate.js';
import { shareTokenRules } from '../validators/fileValidators.js';

const router = Router();

// Public: resolve a share token to file metadata + a short-lived download URL.
router.get('/:token', validate(shareTokenRules), fileController.shared);

export default router;
