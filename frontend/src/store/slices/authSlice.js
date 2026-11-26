import { createSlice } from '@reduxjs/toolkit'

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('draftly-user') || 'null') } catch { return null }
}

const token = localStorage.getItem('draftly-token')
const demoId = localStorage.getItem('draftly-demo-id')
const demoSession = localStorage.getItem('draftly-demo-session') === 'true'

const authSlice = createSlice({
  name: 'auth',
  initialState: { token, user: getStoredUser(), demoId, isDemo: !token && demoSession && Boolean(demoId) },
  reducers: {
    setSession: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.demoId = null
      state.isDemo = false
    },
    setDemoSession: (state, action) => {
      state.token = null
      state.user = null
      state.demoId = action.payload
      state.isDemo = true
    },
    setDemoId: (state, action) => { state.demoId = action.payload },
    clearSession: (state) => {
      state.token = null
      state.user = null
      state.demoId = null
      state.isDemo = false
    },
  },
})

export const { setSession, setDemoSession, setDemoId, clearSession } = authSlice.actions
export default authSlice.reducer
