import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from '@/routes/AppRoutes'
import { store } from '@/store'
import { queryClient } from '@/api/queryClient'
import '@/styles/index.css'

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
        <Toaster position="bottom-right" toastOptions={{ duration: 3200 }} />
      </QueryClientProvider>
    </Provider>
  )
}
