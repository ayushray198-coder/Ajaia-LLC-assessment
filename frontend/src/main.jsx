import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

document.documentElement.dataset.theme = localStorage.getItem('draftly-theme') === 'dark' ? 'dark' : 'light'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
