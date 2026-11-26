import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { WorkspaceLayout } from '@/layout/WorkspaceLayout'
import { AuthPage } from '@/Pages/AuthPage'

const DocumentsDashboard = lazy(() => import('@/Pages/DocumentsDashboard').then((module) => ({ default: module.DocumentsDashboard })))
const DocumentEditorPage = lazy(() => import('@/Pages/DocumentEditorPage').then((module) => ({ default: module.DocumentEditorPage })))

const loading = (label) => <div className="route-state"><span className="notice">{label}</span></div>

function RequireSession() {
  const authenticated = useSelector((state) => Boolean(state.auth.token || state.auth.isDemo))
  const location = useLocation()
  return authenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="signup" element={<AuthPage mode="signup" />} />
        <Route element={<RequireSession />}>
          <Route element={<WorkspaceLayout />}>
            <Route index element={<Suspense fallback={loading('Loading Draftly...')}><DocumentsDashboard /></Suspense>} />
            <Route path="shared" element={<Suspense fallback={loading('Loading Draftly...')}><DocumentsDashboard shared /></Suspense>} />
            <Route path="documents/:id" element={<Suspense fallback={loading('Opening editor...')}><DocumentEditorPage /></Suspense>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
