import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// Runs a list of express-validator chains, then rejects the request with a 400
// if any of them failed. Keeps controllers free of validation concerns.
export function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    next(ApiError.badRequest(errors.array()[0].msg));
  };
}
