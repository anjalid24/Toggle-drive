import { folderService } from '../services/folderService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const folderController = {
  create: asyncHandler(async (req, res) => {
    const folder = await folderService.create(req.user._id, req.body);
    res.status(201).json({ folder });
  }),

  list: asyncHandler(async (req, res) => {
    const folders = await folderService.list(req.user._id, req.query.parent);
    res.json({ folders });
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await folderService.remove(req.user._id, req.params.id);
    res.json(result);
  }),
};
