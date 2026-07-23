import { User } from '../models/User.js';

// Data-access layer for users. Services depend on this instead of touching
// Mongoose directly, which keeps persistence details isolated.
export const userRepository = {
  findById: (id) => User.findById(id),
  findByEmail: (email) => User.findOne({ email: email.toLowerCase() }),
  create: (data) => User.create(data),
  incrementStorage: (id, delta) =>
    User.updateOne({ _id: id }, { $inc: { storageUsed: delta } }),
};
