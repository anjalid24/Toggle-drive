import { Router } from 'express';
import authRoutes from './authRoutes.js';
import fileRoutes from './fileRoutes.js';
import folderRoutes from './folderRoutes.js';
import shareRoutes from './shareRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/folders', folderRoutes);
router.use('/share', shareRoutes);

export default router;
