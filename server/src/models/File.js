import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // null folder means the file lives at the drive root.
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    // Key of the object inside the S3 bucket.
    s3Key: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    // Public share token. When set, anyone with the link can download.
    shareToken: { type: String, default: null, index: true },
    shareExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

fileSchema.index({ owner: 1, folder: 1 });
// Case-insensitive partial name search per owner.
fileSchema.index({ owner: 1, name: 1 });

export const File = mongoose.model('File', fileSchema);
