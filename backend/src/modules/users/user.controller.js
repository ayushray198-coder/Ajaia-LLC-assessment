import { listDemoUsers } from './user.service.js'

export async function list(_request, response) {
  response.json({ success: true, data: await listDemoUsers() })
}
