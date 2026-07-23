import { File } from '../models/File.js';

export const fileRepository = {
  findById: (id) => File.findById(id),
  findByIdForOwner: (id, owner) => File.findOne({ _id: id, owner }),
  findByShareToken: (token) => File.findOne({ shareToken: token }),
  listInFolder: (owner, folder) =>
    File.find({ owner, folder: folder || null }).sort({ createdAt: -1 }),
  search: (owner, regex) =>
    File.find({ owner, name: { $regex: regex, $options: 'i' } }).sort({ createdAt: -1 }),
  listInFolders: (owner, folderIds) => File.find({ owner, folder: { $in: folderIds } }),
  create: (data) => File.create(data),
  deleteById: (id) => File.deleteOne({ _id: id }),
  deleteInFolders: (owner, folderIds) =>
    File.deleteMany({ owner, folder: { $in: folderIds } }),
  countForOwner: (owner) => File.countDocuments({ owner }),
  save: (doc) => doc.save(),
  aggregateByType: (ownerId) =>
    File.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: { $arrayElemAt: [{ $split: ['$mimeType', '/'] }, 0] },
          size: { $sum: '$size' },
          count: { $sum: 1 },
        },
      },
      { $sort: { size: -1 } },
    ]),
};
