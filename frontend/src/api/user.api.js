import { api } from './axiosClient'

export const userApi = {
  async listDemoUsers() {
    return (await api.get('/users')).data.data
  },
}
