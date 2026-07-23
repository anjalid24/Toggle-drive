import { fileService } from '../services/fileService.js';
import { storageService } from '../services/storageService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyDownloadToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';

export const fileController = {
  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file provided');
    const file = await fileService.upload(req.user, req.file, req.body.folder);
    res.status(201).json({ file });
  }),

  list: asyncHandler(async (req, res) => {
    const files = await fileService.list(req.user._id, {
      folder: req.query.folder,
      search: req.query.search,
    });
    res.json({ files });
  }),

  // Returns a short-lived download URL (mirrors the S3 presigned-URL pattern).
  download: asyncHandler(async (req, res) => {
    const url = await fileService.getDownloadUrl(req.user._id, req.params.id);
    res.json({ url });
  }),

  // Token-authorised raw stream. Public route: the download token is the
  // credential, so it also backs share links.
  raw: asyncHandler(async (req, res) => {
    let payload;
    try {
      payload = verifyDownloadToken(req.query.token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired download link');
    }
    if (payload.fid !== req.params.id) throw ApiError.forbidden();

    const file = await fileService.getFileForStream(req.params.id);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.name)}"`
    );
    res.setHeader('Content-Length', file.size);

    const stream = storageService.createReadStream(file.s3Key);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await fileService.remove(req.user._id, req.params.id);
    res.json(result);
  }),

  share: asyncHandler(async (req, res) => {
    const result = await fileService.createShareLink(
      req.user._id,
      req.params.id,
      Number(req.body.expiresInHours) || 0
    );
    res.json(result);
  }),

  revokeShare: asyncHandler(async (req, res) => {
    const result = await fileService.revokeShareLink(req.user._id, req.params.id);
    res.json(result);
  }),

  shared: asyncHandler(async (req, res) => {
    const result = await fileService.getSharedFile(req.params.token);
    res.json(result);
  }),

  storage: asyncHandler(async (req, res) => {
    const stats = await fileService.storageStats(req.user);
    res.json(stats);
  }),
};
