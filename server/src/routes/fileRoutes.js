import { Router } from 'express';
import { fileController } from '../controllers/fileController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { fileIdRules, shareRules } from '../validators/fileValidators.js';

const router = Router();

// Public, token-authorised raw stream (also backs share links). Declared
// before requireAuth so it stays reachable without a session token.
router.get('/:id/raw', validate(fileIdRules), fileController.raw);

router.use(requireAuth);

router.get('/storage', fileController.storage);
router.post('/', upload.single('file'), fileController.upload);
router.get('/', fileController.list);
router.get('/:id/download', validate(fileIdRules), fileController.download);
router.delete('/:id', validate(fileIdRules), fileController.remove);
router.post('/:id/share', validate(shareRules), fileController.share);
router.delete('/:id/share', validate(fileIdRules), fileController.revokeShare);

export default router;
