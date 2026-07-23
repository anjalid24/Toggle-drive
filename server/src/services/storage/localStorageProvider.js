import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import config from '../../config/index.js';
import { logger } from '../../utils/logger.js';

// Local filesystem implementation of the StorageProvider interface. Files are
// written under STORAGE_DIR using the same opaque key stored on the File model.
class LocalStorageProvider {
  constructor(baseDir) {
    this.baseDir = path.resolve(baseDir);
  }

  resolveKey(key) {
    // Guard against path traversal via a crafted key.
    const target = path.resolve(this.baseDir, key);
    if (!target.startsWith(this.baseDir + path.sep) && target !== this.baseDir) {
      throw new Error('Invalid storage key');
    }
    return target;
  }

  async save(key, buffer) {
    const target = this.resolveKey(key);
    await fsp.mkdir(path.dirname(target), { recursive: true });
    await fsp.writeFile(target, buffer);
  }

  createReadStream(key) {
    return fs.createReadStream(this.resolveKey(key));
  }

  async delete(key) {
    try {
      await fsp.unlink(this.resolveKey(key));
    } catch (err) {
      // A missing object is not an error for delete; log anything else.
      if (err.code !== 'ENOENT') {
        logger.error(`Failed to delete local object ${key}:`, err.message);
      }
    }
  }
}

export function createLocalStorageProvider() {
  return new LocalStorageProvider(config.storage.dir);
}
