import { folderRepository } from '../repositories/folderRepository.js';
import { fileService } from './fileService.js';
import { ApiError } from '../utils/ApiError.js';

export const folderService = {
  async create(owner, { name, parent }) {
    if (parent) {
      const parentFolder = await folderRepository.findByIdForOwner(parent, owner);
      if (!parentFolder) throw ApiError.notFound('Parent folder not found');
    }
    return folderRepository.create({ name: name.trim(), owner, parent: parent || null });
  },

  list(owner, parent) {
    return folderRepository.listByParent(owner, parent);
  },

  // Breadth-first collection of a folder and all of its descendants.
  async collectDescendants(owner, rootId) {
    const ids = [rootId];
    const queue = [rootId];
    while (queue.length) {
      const current = queue.shift();
      const children = await folderRepository.childrenIds(owner, current);
      for (const child of children) {
        ids.push(child._id);
        queue.push(child._id);
      }
    }
    return ids;
  },

  async remove(owner, folderId) {
    const folder = await folderRepository.findByIdForOwner(folderId, owner);
    if (!folder) throw ApiError.notFound('Folder not found');

    const folderIds = await this.collectDescendants(owner, folder._id);

    // Remove contained files first so S3/disk objects and the quota reconcile.
    await fileService.deleteFilesInFolders(owner, folderIds);
    await folderRepository.deleteMany(owner, folderIds);

    return { deleted: folderIds.length };
  },
};
