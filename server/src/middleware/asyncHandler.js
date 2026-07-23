// Wraps an async route handler so rejected promises are forwarded to the
// central error handler instead of crashing the process. Removes the need for
// try/catch in every controller.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
