import { Router } from 'express';
import { folderController } from '../controllers/folderController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createFolderRules, folderIdRules } from '../validators/folderValidators.js';

const router = Router();

router.use(requireAuth);
router.post('/', validate(createFolderRules), folderController.create);
router.get('/', folderController.list);
router.delete('/:id', validate(folderIdRules), folderController.remove);

export default router;
