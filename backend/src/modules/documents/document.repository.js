import { Document } from './document.model.js'

const publicUsers = 'name email demoId initials'

export function findPopulatedById(id) {
  return Document.findById(id)
    .populate('owner', publicUsers)
    .populate('sharedWith', publicUsers)
    .populate('sharedPermissions.user', publicUsers)
}

export function listForUser(userId, search) {
  const filter = { $or: [{ owner: userId }, { sharedWith: userId }] }
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.title = { $regex: safeSearch, $options: 'i' }
  }

  return Document.find(filter)
    .select('-content')
    .populate('owner', publicUsers)
    .populate('sharedWith', publicUsers)
    .populate('sharedPermissions.user', publicUsers)
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean()
}

export function create(fields) { return Document.create(fields) }
export function save(document) { return document.save() }
export function remove(id) { return Document.deleteOne({ _id: id }) }
