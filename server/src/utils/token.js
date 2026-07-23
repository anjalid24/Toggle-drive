import jwt from 'jsonwebtoken';
import config from '../config/index.js';

// ── Session tokens ────────────────────────────────────────
export function signAuthToken(userId) {
  return jwt.sign({ sub: userId.toString() }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

// ── Short-lived download tokens ───────────────────────────
// Used by the local storage provider to authorise a direct file stream without
// exposing the session token in the URL. Mirrors the role an S3 presigned URL
// would play, so the storage abstraction stays swappable.
export function signDownloadToken(fileId, expiresInSeconds = 300) {
  return jwt.sign({ fid: fileId.toString(), scope: 'download' }, config.jwt.secret, {
    expiresIn: expiresInSeconds,
  });
}

export function verifyDownloadToken(token) {
  const payload = jwt.verify(token, config.jwt.secret);
  if (payload.scope !== 'download') {
    throw new Error('Invalid token scope');
  }
  return payload;
}
