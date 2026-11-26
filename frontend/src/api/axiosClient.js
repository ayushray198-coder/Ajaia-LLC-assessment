import axios from 'axios'
import { store } from '@/store'
import { clearSession } from '@/store/slices/authSlice'

const apiBaseUrl = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'https://ajaia-llc-assessment.onrender.com/api'
)

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('draftly-token')
  const demoId = localStorage.getItem('draftly-demo-id')
  if (token) config.headers.Authorization = `Bearer ${token}`
  else if (demoId) config.headers['X-Demo-User'] = demoId
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data
    if (error.response?.status === 401 && payload?.code === 'UNAUTHENTICATED' && localStorage.getItem('draftly-token')) {
      store.dispatch(clearSession())
    }
    error.apiError = {
      message: payload?.message || (error.code === 'ECONNABORTED' ? 'The request timed out. Try again.' : 'Could not reach Draftly. Check that the API is running.'),
      code: payload?.code || 'NETWORK_ERROR',
      status: error.response?.status,
    }
    return Promise.reject(error)
  },
)
