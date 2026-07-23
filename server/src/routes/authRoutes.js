import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { signupRules, loginRules } from '../validators/authValidators.js';

const router = Router();

// Slow down credential brute-force attempts.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });

router.post('/signup', authLimiter, validate(signupRules), authController.signup);
router.post('/login', authLimiter, validate(loginRules), authController.login);
router.get('/me', requireAuth, authController.me);

export default router;
