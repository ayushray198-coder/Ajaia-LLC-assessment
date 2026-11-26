import { z } from 'zod'
import { createDocumentSchema, updateDocumentSchema } from './document.validation.js'
import * as documents from './document.service.js'

const searchSchema = z.string().trim().max(80).default('')

export async function list(request, response) {
  const search = searchSchema.parse(request.query.q)
  const data = await documents.listDocuments(request.user, search)
  response.json({ success: true, data })
}

export async function create(request, response) {
  const input = createDocumentSchema.parse(request.body)
  const data = await documents.createDocument(request.user, input)
  response.status(201).json({ success: true, data })
}

export async function get(request, response) {
  const data = await documents.getDocument(request.params.id, request.user)
  response.json({ success: true, data })
}

export async function update(request, response) {
  const input = updateDocumentSchema.parse(request.body)
  const data = await documents.updateDocument(request.params.id, request.user, input)
  response.json({ success: true, data })
}

export async function remove(request, response) {
  await documents.deleteDocument(request.params.id, request.user)
  response.status(204).end()
}
