import mongoose from 'mongoose'
import { AppError } from '../../shared/errors/AppError.js'
import * as documentRepository from './document.repository.js'
import { canDeleteDocument, canEditDocument, canReadDocument } from './document.policy.js'

const notFound = () => new AppError(404, 'Document not found.', 'DOCUMENT_NOT_FOUND')

export async function findAccessibleDocument(id, userId) {
  if (!mongoose.isValidObjectId(id)) throw notFound()
  const document = await documentRepository.findPopulatedById(id)
  if (!document || !canReadDocument(document, userId)) throw notFound()
  return document
}

export function listDocuments(user, search = '') {
  return documentRepository.listForUser(user._id, search)
}

export async function createDocument(user, input) {
  const document = await documentRepository.create({ ...input, owner: user._id })
  return findAccessibleDocument(document._id, user._id)
}

export function getDocument(id, user) {
  return findAccessibleDocument(id, user._id)
}

export function persistDocument(document) {
  return documentRepository.save(document)
}

export async function updateDocument(id, user, input) {
  const document = await findAccessibleDocument(id, user._id)
  if (!canEditDocument(document, user._id)) throw notFound()
  if (input.title !== undefined) document.title = input.title
  if (input.content !== undefined) document.content = input.content
  await documentRepository.save(document)
  return findAccessibleDocument(id, user._id)
}

export async function deleteDocument(id, user) {
  const document = await findAccessibleDocument(id, user._id)
  if (!canDeleteDocument(document, user._id)) throw new AppError(403, 'Only the owner can delete this document.', 'OWNER_REQUIRED')
  await documentRepository.remove(document._id)
}
