import { authService } from '../services/authService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const authController = {
  signup: asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  }),

  me: asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
};
