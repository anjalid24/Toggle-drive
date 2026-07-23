import { nanoid } from 'nanoid';
import { fileRepository } from '../repositories/fileRepository.js';
import { folderRepository } from '../repositories/folderRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { storageService } from './storageService.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const fileService = {
  async upload(user, { originalname, buffer, size, mimetype }, folderId) {
    if (folderId) {
      const folder = await folderRepository.findByIdForOwner(folderId, user._id);
      if (!folder) throw ApiError.notFound('Target folder not found');
    }

    if (user.storageUsed + size > user.storageQuota) {
      throw ApiError.payloadTooLarge('Storage quota exceeded');
    }

    const s3Key = `${user._id}/${nanoid()}-${originalname}`;
    await storageService.save(s3Key, buffer, mimetype);

    const file = await fileRepository.create({
      name: originalname,
      owner: user._id,
      folder: folderId || null,
      s3Key,
      size,
      mimeType: mimetype,
    });

    await userRepository.incrementStorage(user._id, size);
    return file;
  },

  list(owner, { folder, search }) {
    if (search && search.trim()) {
      return fileRepository.search(owner, escapeRegex(search.trim()));
    }
    return fileRepository.listInFolder(owner, folder);
  },

  async getDownloadUrl(owner, fileId) {
    const file = await fileRepository.findByIdForOwner(fileId, owner);
    if (!file) throw ApiError.notFound('File not found');
    return storageService.buildDownloadUrl(file._id);
  },

  // Resolve a file for streaming. Called by the raw endpoint after the
  // short-lived download token has already been verified, so the token itself
  // is the authorisation — no owner check is needed here.
  async getFileForStream(fileId) {
    const file = await fileRepository.findById(fileId);
    if (!file) throw ApiError.notFound('File not found');
    return file;
  },

  async remove(owner, fileId) {
    const file = await fileRepository.findByIdForOwner(fileId, owner);
    if (!file) throw ApiError.notFound('File not found');

    await storageService.delete(file.s3Key);
    await fileRepository.deleteById(file._id);
    await userRepository.incrementStorage(owner, -file.size);
    return { deleted: true };
  },

  async createShareLink(owner, fileId, expiresInHours) {
    const file = await fileRepository.findByIdForOwner(fileId, owner);
    if (!file) throw ApiError.notFound('File not found');

    file.shareToken = file.shareToken || nanoid(24);
    file.shareExpires =
      expiresInHours > 0 ? new Date(Date.now() + expiresInHours * 3600 * 1000) : null;
    await fileRepository.save(file);

    return { shareToken: file.shareToken, shareExpires: file.shareExpires };
  },

  async revokeShareLink(owner, fileId) {
    const file = await fileRepository.findByIdForOwner(fileId, owner);
    if (!file) throw ApiError.notFound('File not found');
    file.shareToken = null;
    file.shareExpires = null;
    await fileRepository.save(file);
    return { revoked: true };
  },

  async getSharedFile(token) {
    const file = await fileRepository.findByShareToken(token);
    if (!file) throw ApiError.notFound('Shared file not found');
    if (file.shareExpires && file.shareExpires < new Date()) {
      throw ApiError.gone('This share link has expired');
    }
    return {
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      url: storageService.buildDownloadUrl(file._id),
    };
  },

  async storageStats(user) {
    const fresh = await userRepository.findById(user._id);
    const [fileCount, folderCount, byType] = await Promise.all([
      fileRepository.countForOwner(user._id),
      folderRepository.countForOwner(user._id),
      fileRepository.aggregateByType(fresh._id),
    ]);

    return {
      storageUsed: fresh.storageUsed,
      storageQuota: fresh.storageQuota,
      fileCount,
      folderCount,
      byType: byType.map((t) => ({ type: t._id || 'other', size: t.size, count: t.count })),
    };
  },

  // Cascade helper used when a folder is deleted.
  async deleteFilesInFolders(owner, folderIds) {
    const files = await fileRepository.listInFolders(owner, folderIds);
    let freed = 0;
    for (const file of files) {
      await storageService.delete(file.s3Key);
      freed += file.size;
    }
    await fileRepository.deleteInFolders(owner, folderIds);
    if (freed > 0) await userRepository.incrementStorage(owner, -freed);
    logger.debug(`Cascade-deleted ${files.length} files, freed ${freed} bytes`);
  },
};
