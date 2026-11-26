import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({ reducer: { auth: authReducer, ui: uiReducer } })

store.subscribe(() => {
  const { token, user, demoId, isDemo } = store.getState().auth
  if (token) localStorage.setItem('draftly-token', token)
  else localStorage.removeItem('draftly-token')
  if (user) localStorage.setItem('draftly-user', JSON.stringify(user))
  else localStorage.removeItem('draftly-user')
  if (demoId) localStorage.setItem('draftly-demo-id', demoId)
  else localStorage.removeItem('draftly-demo-id')
  if (isDemo) localStorage.setItem('draftly-demo-session', 'true')
  else localStorage.removeItem('draftly-demo-session')
})
