// Operational error with an HTTP status code. Thrown from the service layer and
// translated into a JSON response by the central error handler.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad request') {
    return new ApiError(400, msg);
  }
  static unauthorized(msg = 'Authentication required') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Not found') {
    return new ApiError(404, msg);
  }
  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg);
  }
  static gone(msg = 'Gone') {
    return new ApiError(410, msg);
  }
  static payloadTooLarge(msg = 'Payload too large') {
    return new ApiError(413, msg);
  }
}
