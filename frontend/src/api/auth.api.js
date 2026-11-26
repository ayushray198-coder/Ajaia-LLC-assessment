import { api } from './axiosClient'

export const authApi = {
  async login(credentials) { return (await api.post('/auth/login', credentials)).data.data },
  async signup(details) { return (await api.post('/auth/register', details)).data.data },
}
