import { shareDocumentSchema, updateShareRoleSchema } from './sharing.validation.js'
import * as sharing from './sharing.service.js'

export async function share(request, response) {
  const { userId, role } = shareDocumentSchema.parse(request.body)
  const data = await sharing.shareDocument(request.params.id, request.user, userId, role)
  response.json({ success: true, data })
}

export async function updateRole(request, response) {
  const { role } = updateShareRoleSchema.parse(request.body)
  const data = await sharing.updateShareRole(request.params.id, request.user, request.params.userId, role)
  response.json({ success: true, data })
}

export async function revoke(request, response) {
  const data = await sharing.revokeShare(request.params.id, request.user, request.params.userId)
  response.json({ success: true, data })
}
