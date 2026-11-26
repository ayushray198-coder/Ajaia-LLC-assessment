import { api } from './axiosClient'

export const documentApi = {
  async list(search) { return (await api.get('/documents', { params: search ? { q: search } : {} })).data.data },
  async get(id) { return (await api.get(`/documents/${id}`)).data.data },
  async create(payload = {}) { return (await api.post('/documents', payload)).data.data },
  async update(id, payload) { return (await api.patch(`/documents/${id}`, payload)).data.data },
  async remove(id) { await api.delete(`/documents/${id}`) },
  async share(id, userId, role = 'editor') { return (await api.post(`/documents/${id}/share`, { userId, role })).data.data },
  async updateShareRole(id, userId, role) { return (await api.patch(`/documents/${id}/share/${userId}`, { role })).data.data },
  async revoke(id, userId) { return (await api.delete(`/documents/${id}/share/${userId}`)).data.data },
  async importFile(fileName, content) { return (await api.post('/documents/import', { fileName, content })).data.data },
}
