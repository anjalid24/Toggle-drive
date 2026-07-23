import mongoose from 'mongoose';
import config from '../config/index.js';

const DEFAULT_QUOTA = config.limits.defaultQuota;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    // Bytes currently used across all of the user's files.
    storageUsed: { type: Number, default: 0 },
    // Maximum bytes the user is allowed to store.
    storageQuota: { type: Number, default: DEFAULT_QUOTA },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', userSchema);
