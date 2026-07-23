import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { signAuthToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';

export const authService = {
  async signup({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('An account with that email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ name, email, passwordHash });

    return { token: signAuthToken(user._id), user };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    // Compare even when the user is missing to avoid leaking which emails exist.
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !ok) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    return { token: signAuthToken(user._id), user };
  },
};
