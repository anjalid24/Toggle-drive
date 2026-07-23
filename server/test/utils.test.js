import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/utils/ApiError.js';

test('ApiError factories set the right status codes', () => {
  assert.equal(ApiError.badRequest().status, 400);
  assert.equal(ApiError.unauthorized().status, 401);
  assert.equal(ApiError.forbidden().status, 403);
  assert.equal(ApiError.notFound().status, 404);
  assert.equal(ApiError.conflict().status, 409);
  assert.equal(ApiError.gone().status, 410);
  assert.equal(ApiError.payloadTooLarge().status, 413);
});

test('ApiError carries a custom message and is operational', () => {
  const err = ApiError.notFound('File not found');
  assert.equal(err.message, 'File not found');
  assert.equal(err.isOperational, true);
  assert.ok(err instanceof Error);
});

test('download tokens round-trip and reject the wrong scope', async () => {
  process.env.JWT_SECRET = 'test-secret';
  const { signDownloadToken, verifyDownloadToken, signAuthToken } = await import(
    '../src/utils/token.js'
  );

  const payload = verifyDownloadToken(signDownloadToken('file123'));
  assert.equal(payload.fid, 'file123');
  assert.equal(payload.scope, 'download');

  // An auth token must not be accepted as a download token.
  assert.throws(() => verifyDownloadToken(signAuthToken('user123')));
});
