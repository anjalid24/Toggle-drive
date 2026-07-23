import { body, param } from 'express-validator';

export const createFolderRules = [
  body('name').trim().notEmpty().withMessage('Folder name is required'),
  body('parent').optional({ nullable: true }).isMongoId().withMessage('Invalid parent id'),
];

export const folderIdRules = [param('id').isMongoId().withMessage('Invalid folder id')];
