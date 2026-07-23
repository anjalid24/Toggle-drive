import { verifyAuthToken } from '../utils/token.js';
import { userRepository } from '../repositories/userRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from './asyncHandler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await userRepository.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  next();
});
