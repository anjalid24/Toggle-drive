/**
 * StorageProvider is the abstraction every concrete storage backend implements.
 * The rest of the application depends only on this interface, so a new backend
 * (e.g. an S3 provider) can be introduced later without changing any service,
 * controller, or route.
 *
 * @typedef {Object} StorageProvider
 * @property {(key: string, buffer: Buffer, contentType: string) => Promise<void>} save
 * @property {(key: string) => import('stream').Readable | Promise<import('stream').Readable>} createReadStream
 * @property {(key: string) => Promise<void>} delete
 */

// This file is intentionally documentation-only; JavaScript has no interfaces.
export {};
