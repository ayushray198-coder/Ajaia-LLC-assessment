import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function WorkspaceLayout() {
  return (
    <div className="workspace-shell">
      <Sidebar />
      <main className="main-panel"><Outlet /></main>
    </div>
  )
}
