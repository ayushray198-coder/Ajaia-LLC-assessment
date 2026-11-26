import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BookOpenText, ChevronDown, FilePlus2, Files, LogOut, Menu, Search, UsersRound, X } from 'lucide-react'
import { clearSession, setDemoId } from '@/store/slices/authSlice'
import { closeSidebar, toggleSidebar } from '@/store/slices/uiSlice'
import { useDemoUsersQuery } from '@/hooks/users/useDemoUsersQuery'
import { useCreateDocumentMutation } from '@/hooks/documents/useDocuments'
import { Avatar } from '@/Components/common/Avatar'
import { LoadingNotice } from '@/Components/common/Notice'
import { api } from '@/api/axiosClient'
import toast from 'react-hot-toast'

export function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { demoId, user, isDemo } = useSelector((state) => state.auth)
  const isOpen = useSelector((state) => state.ui.sidebarOpen)
  const users = useDemoUsersQuery()
  const createDocument = useCreateDocumentMutation()
  const switchIdentity = useMutation({ mutationFn: async (nextId) => (await api.post('/auth/switch', { demoId: nextId })).data.data })
  const currentUser = user || users.data?.find((person) => person.demoId === demoId)

  async function handleCreate() {
    try {
      const document = await createDocument.mutateAsync({ title: 'Untitled document' })
      dispatch(closeSidebar())
      navigate(`/documents/${document._id}`)
    } catch (error) { toast.error(error.apiError?.message || 'Could not create a document.') }
  }

  async function switchUser(event) {
    const nextId = event.target.value
    try {
      await switchIdentity.mutateAsync(nextId)
      dispatch(setDemoId(nextId))
      queryClient.invalidateQueries()
      dispatch(closeSidebar())
      if (location.pathname.startsWith('/documents/')) navigate('/')
      toast.success(`Viewing as ${users.data?.find((person) => person.demoId === nextId)?.name || 'demo user'}`)
    } catch (error) { toast.error(error.apiError?.message || 'Could not switch demo user.') }
  }

  function signOut() {
    dispatch(clearSession())
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => dispatch(toggleSidebar())}><Menu size={20} /></button>
      <div className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} onClick={() => dispatch(closeSidebar())} />
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <span className="brand-mark"><BookOpenText size={19} strokeWidth={2.3} /></span>
          <div className="brand-name">draftly<span>.</span><small>YOUR IDEAS, IN ORDER</small></div>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => dispatch(closeSidebar())}><X size={18} /></button>
        </div>
        <button className="button button-primary create-button" onClick={handleCreate} disabled={createDocument.isPending}>
          <FilePlus2 size={17} /> {createDocument.isPending ? 'Creating…' : 'New document'}
        </button>
        <div className="sidebar-search" onClick={() => { navigate('/'); dispatch(closeSidebar()); document.getElementById('document-search')?.focus() }}>
          <Search size={16} /><span>Search documents</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink to="/" end onClick={() => dispatch(closeSidebar())} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Files size={17} />My documents</NavLink>
          <NavLink to="/shared" onClick={() => dispatch(closeSidebar())} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><UsersRound size={17} />Shared with me</NavLink>
        </nav>
        <div className="sidebar-spacer" />
        <div className="demo-label">{isDemo ? 'DEMO ACCOUNT' : 'YOUR ACCOUNT'}</div>
        {isDemo && users.isLoading ? <LoadingNotice label="Loading users…" /> : isDemo && users.isError ? <div className="sidebar-error">API unavailable. Start the backend to continue.</div> : (
          <div className="profile-switcher">
            <Avatar user={currentUser} />
            <span className="profile-copy"><strong>{currentUser?.name || 'Your account'}</strong><small>{currentUser?.email || 'Draftly workspace'}</small></span>
            {isDemo ? <><ChevronDown size={16} /><select aria-label="Switch demo user" value={demoId} onChange={switchUser} disabled={switchIdentity.isPending}>
              {users.data?.filter((person) => ['ayush', 'rahul', 'priya'].includes(person.demoId)).map((person) => <option key={person._id} value={person.demoId}>{person.name}</option>)}
            </select></> : <button type="button" className="sidebar-signout" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>}
          </div>
        )}
        <p className="demo-note">{isDemo ? 'Demo mode · changes persist to your database' : 'Your documents are saved to your account'}</p>
        {isDemo && <button type="button" className="sidebar-signout sidebar-demo-signout" onClick={signOut}><LogOut size={14} /> Leave demo</button>}
      </aside>
    </>
  )
}
