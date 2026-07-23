import { body, param } from 'express-validator';

export const fileIdRules = [param('id').isMongoId().withMessage('Invalid file id')];

export const shareRules = [
  ...fileIdRules,
  body('expiresInHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('expiresInHours must be a non-negative number'),
];

export const shareTokenRules = [
  param('token').isString().isLength({ min: 8 }).withMessage('Invalid share token'),
];
