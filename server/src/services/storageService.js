import config from '../config/index.js';
import { createLocalStorageProvider } from './storage/localStorageProvider.js';
import { signDownloadToken } from '../utils/token.js';

// Select the storage backend from configuration. New drivers (e.g. 's3') are
// registered here; nothing else in the app needs to know which one is active.
function createProvider() {
  switch (config.storage.driver) {
    case 'local':
      return createLocalStorageProvider();
    default:
      throw new Error(`Unknown storage driver: ${config.storage.driver}`);
  }
}

const provider = createProvider();

export const storageService = {
  save: (key, buffer, contentType) => provider.save(key, buffer, contentType),
  createReadStream: (key) => provider.createReadStream(key),
  delete: (key) => provider.delete(key),

  /**
   * Build a client-facing download URL for a file. For the local driver this is
   * a short-lived, token-authorised stream endpoint. A future S3 driver would
   * return a presigned S3 URL instead — the caller does not care which.
   */
  buildDownloadUrl(fileId) {
    const token = signDownloadToken(fileId);
    return `${config.storage.publicApiUrl}/api/files/${fileId}/raw?token=${token}`;
  },
};
