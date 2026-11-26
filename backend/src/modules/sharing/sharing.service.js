import mongoose from 'mongoose'
import { AppError } from '../../shared/errors/AppError.js'
import { findById } from '../users/user.repository.js'
import { findAccessibleDocument, persistDocument } from '../documents/document.service.js'
import { canShareDocument } from '../documents/document.policy.js'

const idOf = (value) => String(value?._id ?? value)

export async function shareDocument(id, user, recipientId, role = 'editor') {
  const document = await findAccessibleDocument(id, user._id)
  if (!canShareDocument(document, user._id)) throw new AppError(403, 'Only the owner can share this document.', 'OWNER_REQUIRED')
  const recipient = await findById(recipientId)
  if (!recipient || String(recipient._id) === String(user._id)) {
    throw new AppError(400, 'Choose another Draftly user.', 'INVALID_RECIPIENT')
  }
  if (!document.sharedWith.some((sharedUser) => idOf(sharedUser) === String(recipient._id))) document.sharedWith.push(recipient._id)
  const permission = document.sharedPermissions.find((entry) => idOf(entry.user) === String(recipient._id))
  if (permission) permission.role = role
  else document.sharedPermissions.push({ user: recipient._id, role })
  await persistDocument(document)
  return findAccessibleDocument(id, user._id)
}

export async function updateShareRole(id, user, recipientId, role) {
  const document = await findAccessibleDocument(id, user._id)
  if (!canShareDocument(document, user._id)) throw new AppError(403, 'Only the owner can change sharing.', 'OWNER_REQUIRED')
  const isShared = document.sharedWith.some((sharedUser) => idOf(sharedUser) === recipientId)
  if (!isShared) throw new AppError(404, 'Shared user not found.', 'USER_NOT_FOUND')
  let permission = document.sharedPermissions.find((entry) => idOf(entry.user) === recipientId)
  if (!permission) {
    permission = { user: recipientId, role }
    document.sharedPermissions.push(permission)
  } else {
    permission.role = role
  }
  await persistDocument(document)
  return findAccessibleDocument(id, user._id)
}

export async function revokeShare(id, user, recipientId) {
  const document = await findAccessibleDocument(id, user._id)
  if (!canShareDocument(document, user._id)) throw new AppError(403, 'Only the owner can change sharing.', 'OWNER_REQUIRED')
  if (!mongoose.isValidObjectId(recipientId)) throw new AppError(404, 'Shared user not found.', 'USER_NOT_FOUND')
  document.sharedWith = document.sharedWith.filter((sharedUser) => String(sharedUser._id) !== recipientId)
  document.sharedPermissions = document.sharedPermissions.filter((entry) => idOf(entry.user) !== recipientId)
  await persistDocument(document)
  return findAccessibleDocument(id, user._id)
}
