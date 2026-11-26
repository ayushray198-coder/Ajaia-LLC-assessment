import { User } from './user.model.js'

export function findByDemoId(demoId) {
  return User.findOne({ demoId }).select('name email demoId initials')
}

export function findById(id) {
  return User.findById(id).select('name email demoId initials')
}

export function findByEmail(email) {
  return User.findOne({ email }).select('+passwordHash')
}

export function createUser(user) {
  return User.create(user)
}

export function listUsers() {
  return User.find().select('name email demoId initials').sort({ name: 1 }).lean()
}

export function upsertDemoUser({ demoId, ...user }) {
  return User.updateOne({ demoId }, { $setOnInsert: { ...user, demoId } }, { upsert: true })
}
