import { useDeferredValue, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowDownWideNarrow, CloudUpload, FilePlus2, FileText, Search, Share2, Sparkles } from 'lucide-react'
import { useCreateDocumentMutation, useDocumentsQuery } from '@/hooks/documents/useDocuments'
import { DocumentRow } from '@/Components/documents/DocumentRow'
import { FileImportButton } from '@/Components/file-import/FileImportButton'
import { ErrorNotice, LoadingNotice } from '@/Components/common/Notice'
import toast from 'react-hot-toast'
import { ThemeToggle } from '@/Components/common/ThemeToggle'
import { isCurrentUser } from '@/lib/auth/identity'

export function DocumentsDashboard({ shared = false }) {
  const auth = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search.trim())
  const documents = useDocumentsQuery(deferredSearch)
  const createDocument = useCreateDocumentMutation()
  const visibleDocuments = (documents.data || []).filter((item) => shared ? !isCurrentUser(item.owner, auth) : isCurrentUser(item.owner, auth))

  async function create() {
    try {
      const item = await createDocument.mutateAsync({ title: 'Untitled document' })
      navigate(`/documents/${item._id}`)
    } catch (error) { toast.error(error.apiError?.message || 'Could not create a document.') }
  }

  return (
    <section className="dashboard page-enter">
      <header className="page-topline"><div className="breadcrumbs"><span className="topbar-brand-mark">d</span><span className="topbar-brand-name">Draftly</span><span>/</span> {shared ? 'Shared with me' : 'My workspace'}</div><div className="topline-actions"><div className="connection-pill"><span />All systems ready</div><ThemeToggle /></div></header>
      <div className="dashboard-heading">
        <div><div className="eyebrow"><Sparkles size={14} /> A QUIETER SPACE TO THINK</div><h1>{shared ? 'Shared with me' : 'Your workspace'}</h1><p>{shared ? 'Documents your collaborators have shared with you.' : 'Good ideas deserve a place to grow.'}</p></div>
        <div className="heading-actions"><FileImportButton /><button className="button button-primary" onClick={create} disabled={createDocument.isPending}><FilePlus2 size={17} />{createDocument.isPending ? 'Creating…' : 'New document'}</button></div>
      </div>

      {!shared && <div className="workspace-highlights" aria-label="Workspace highlights">
        <article className="highlight-card highlight-card-library"><span className="highlight-icon"><FileText size={17} /></span><div><small>IN YOUR LIBRARY</small><strong>{visibleDocuments.length} {visibleDocuments.length === 1 ? 'document' : 'documents'}</strong></div><span className="highlight-accent" /></article>
        <article className="highlight-card highlight-card-save"><span className="highlight-icon"><CloudUpload size={17} /></span><div><small>WHILE YOU WRITE</small><strong>Changes save automatically</strong></div><span className="highlight-accent" /></article>
        <article className="highlight-card highlight-card-share"><span className="highlight-icon"><Share2 size={17} /></span><div><small>WHEN YOU’RE READY</small><strong>Share with your team</strong></div><span className="highlight-accent" /></article>
      </div>}

      <div className="section-heading"><div><h2>{shared ? 'Shared documents' : 'Recently updated'}</h2><span>{visibleDocuments.length} {visibleDocuments.length === 1 ? 'document' : 'documents'}</span></div><label className="search-field"><Search size={17} /><input id="document-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents" /></label></div>

      {documents.isLoading ? <LoadingNotice /> : documents.isError ? <ErrorNotice error={documents.error} onRetry={() => documents.refetch()} /> : visibleDocuments.length ? (
        <div className="document-table">
          <div className="table-head"><span>TITLE</span><span>OWNER</span><span><ArrowDownWideNarrow size={14} /> LAST EDITED</span><span aria-hidden="true" /></div>
          {visibleDocuments.map((item) => <DocumentRow key={item._id} document={item} auth={auth} />)}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-illustration"><FilePlus2 size={25} /></div><h3>{deferredSearch ? 'No matching documents' : shared ? 'Nothing shared yet' : 'Your first page is waiting'}</h3><p>{deferredSearch ? 'Try a different title or clear your search.' : shared ? 'When someone shares a document with you, it will appear here.' : 'Start with a blank page, or bring in a text or Markdown file.'}</p>{!deferredSearch && !shared && <div className="empty-actions"><button className="button button-primary" onClick={create}><FilePlus2 size={16} />Create a document</button><FileImportButton compact /></div>}</div>
      )}
      <footer className="dashboard-footer"><span>Draftly keeps your ideas together.</span><span>{visibleDocuments.length ? 'Sorted by most recently edited' : 'Your workspace is ready when you are'}</span></footer>
    </section>
  )
}
