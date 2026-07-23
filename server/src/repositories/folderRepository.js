import { Folder } from '../models/Folder.js';

export const folderRepository = {
  findByIdForOwner: (id, owner) => Folder.findOne({ _id: id, owner }),
  listByParent: (owner, parent) =>
    Folder.find({ owner, parent: parent || null }).sort({ name: 1 }),
  childrenIds: (owner, parent) =>
    Folder.find({ owner, parent }).select('_id').lean(),
  create: (data) => Folder.create(data),
  deleteMany: (owner, ids) => Folder.deleteMany({ _id: { $in: ids }, owner }),
  countForOwner: (owner) => Folder.countDocuments({ owner }),
};
