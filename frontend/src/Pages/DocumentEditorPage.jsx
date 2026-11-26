import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Check, ChevronRight, CloudUpload, FileText, ListTree, Share2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDocumentQuery, useDeleteDocumentMutation, useUpdateDocumentMutation } from '@/hooks/documents/useDocuments'
import { RichTextEditor } from '@/Components/editor/RichTextEditor'
import { ShareDialog } from '@/Components/sharing/ShareDialog'
import { FileImportButton } from '@/Components/file-import/FileImportButton'
import { DocumentDownloadMenu } from '@/Components/documents/DocumentDownloadMenu'
import { downloadDocument } from '@/lib/documents/exportDocument'
import { Avatar } from '@/Components/common/Avatar'
import { ErrorNotice, LoadingNotice } from '@/Components/common/Notice'
import { ThemeToggle } from '@/Components/common/ThemeToggle'
import { getDocumentRole, isCurrentUser } from '@/lib/auth/identity'

function EditableDocument({ document }) {
  const navigate = useNavigate()
  const auth = useSelector((state) => state.auth)
  const updateDocument = useUpdateDocumentMutation(document._id)
  const deleteDocument = useDeleteDocumentMutation()
  const isOwner = isCurrentUser(document.owner, auth)
  const canEdit = ['owner', 'editor'].includes(getDocumentRole(document, auth))
  const [title, setTitle] = useState(document.title)
  const [saveState, setSaveState] = useState('saved')
  const [shareOpen, setShareOpen] = useState(false)
  const [toolbarHost, setToolbarHost] = useState(null)
  const [headings, setHeadings] = useState(() => (document.content?.content || []).filter((node) => node.type === 'heading').map((node, index) => ({ id: `heading-${index}`, level: node.attrs.level, text: node.content?.map((part) => part.text || '').join('') || 'Untitled heading' })))
  const timer = useRef(null)
  const revision = useRef(0)
  const savedRevision = useRef(0)
  const queuedRevision = useRef(0)
  const latest = useRef({ title: document.title, content: document.content })
  const saveRequest = useRef(updateDocument.mutateAsync)
  const queue = useRef(Promise.resolve())

  const persistSave = useCallback((revisionToSave) => {
    if (revisionToSave <= savedRevision.current) return Promise.resolve()
    if (revisionToSave <= queuedRevision.current) return queue.current

    queuedRevision.current = revisionToSave
    const payload = { ...latest.current }
    const request = queue.current.catch(() => {}).then(() => saveRequest.current(payload))
    queue.current = request.then((result) => {
      savedRevision.current = Math.max(savedRevision.current, revisionToSave)
      if (revision.current === revisionToSave) setSaveState('saved')
      return result
    }).catch((error) => {
      queuedRevision.current = savedRevision.current
      if (revision.current === revisionToSave) setSaveState('error')
      throw error
    })
    return queue.current
  }, [])

  const scheduleSave = useCallback((next) => {
    latest.current = { ...latest.current, ...next }
    const currentRevision = ++revision.current
    setSaveState('saving')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      timer.current = null
      persistSave(currentRevision).catch(() => {})
    }, 650)
  }, [persistSave])

  const flushSave = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = null
    return persistSave(revision.current).catch(() => {})
  }, [persistSave])

  useEffect(() => () => {
    if (timer.current !== null || savedRevision.current < revision.current) {
      window.clearTimeout(timer.current)
      timer.current = null
      persistSave(revision.current).catch(() => {})
    }
  }, [persistSave])

  async function remove() {
    if (!isOwner || !window.confirm(`Delete “${document.title}”? This cannot be undone.`)) return
    try { await deleteDocument.mutateAsync(document._id); toast.success('Document deleted'); navigate('/') }
    catch (error) { toast.error(error.apiError?.message || 'Could not delete this document.') }
  }

  const saveLabel = saveState === 'saving' ? 'Saving changes' : saveState === 'error' ? 'Save failed · click to retry' : 'All changes saved'

  return (
    <section className="editor-page page-enter">
      <header className="editor-topbar">
        <button className="icon-button back-button" aria-label="Back to workspace" onClick={() => navigate('/')}><ArrowLeft size={19} /></button>
        <div className="editor-brand"><span className="brand-mark brand-mark-small">d</span><span>Draftly</span><i>/</i><strong>{isOwner ? 'My documents' : `${document.owner?.name}'s document`}</strong></div>
        <input className="editor-name-input" aria-label="Document title" value={title} maxLength={120} readOnly={!canEdit} onChange={(event) => { const value = event.target.value; setTitle(value); if (value.trim()) scheduleSave({ title: value }) }} onBlur={() => { if (!title.trim()) { setTitle(latest.current.title); toast.error('A document needs a title.') } }} placeholder="Untitled document" />
        <button className={`save-indicator ${saveState}`} onClick={() => { if (canEdit && saveState === 'error') scheduleSave({}) }} title={canEdit ? saveLabel : 'You have view-only access.'}>
          {!canEdit ? <Check size={16} /> : saveState === 'saving' ? <CloudUpload size={16} /> : saveState === 'saved' ? <Check size={16} /> : <CloudUpload size={16} />}{canEdit ? saveLabel : 'View only'}
        </button>
        <span className="topbar-avatar"><Avatar user={document.owner} size="small" /></span>
        {isOwner && <button className="button button-secondary share-button" onClick={() => setShareOpen(true)}><Share2 size={16} />Share{document.sharedWith?.length ? <span className="share-count">{document.sharedWith.length}</span> : null}</button>}
        <ThemeToggle />
      </header>

      <div className="editor-actionbar">
        <div className="save-owner"><span className="editor-presence-dot" />{isOwner ? 'Your workspace' : `Shared by ${document.owner?.name}`}</div>
        <div className="editor-tool-slot" ref={setToolbarHost} />
        <div className="editor-actions">{canEdit && <FileImportButton compact />}<DocumentDownloadMenu onDownload={(format) => downloadDocument({ title, content: latest.current.content, format })} />{isOwner && <button className="icon-button editor-delete" aria-label="Delete document" title="Delete document" onClick={remove}><Trash2 size={16} /></button>}</div>
      </div>

      <div className="editor-workspace">
        <aside className="editor-outline">
          <div className="outline-heading"><ListTree size={16} /><span>Document outline</span></div>
          <div className="outline-divider" />
          {headings.length ? <nav className="outline-list" aria-label="Document outline">{headings.map((heading, index) => <button key={`${heading.id}-${index}`} className={`outline-item level-${heading.level}`} onClick={() => window.document.querySelectorAll('.tiptap-content h1, .tiptap-content h2')[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><ChevronRight size={13} /><span>{heading.text}</span></button>)}</nav> : <div className="outline-empty"><FileText size={19} /><p>Headings you add to the document will appear here.</p><span>Use Heading 1 or Heading 2 in the toolbar.</span></div>}
          <div className="outline-tip"><span className="outline-tip-mark">i</span><span>Use headings to keep longer documents easy to navigate.</span></div>
        </aside>
        <div className="editor-canvas">
          <div className="editor-ruler" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>
      <div className="writing-column">
        <div className="document-metadata"><span>Edited {new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(new Date(document.updatedAt))}</span><span className="metadata-dot">·</span><span>{isOwner ? document.sharedWith?.length ? `Shared with ${document.sharedWith.length} collaborator${document.sharedWith.length === 1 ? '' : 's'}` : 'Private to you' : `Shared by ${document.owner?.name}`}</span></div>
            {document.content?.content?.length ? <RichTextEditor key={document._id} content={document.content} editable={canEdit} onChange={(content) => scheduleSave({ content })} onBlur={flushSave} onOutlineChange={setHeadings} toolbarHost={toolbarHost} /> : <RichTextEditor key={document._id} content={{ type: 'doc', content: [{ type: 'paragraph' }] }} editable={canEdit} onChange={(content) => scheduleSave({ content })} onBlur={flushSave} onOutlineChange={setHeadings} toolbarHost={toolbarHost} />}
        <div className="editor-bottom-note"><span>Draftly saves as you write</span><span>Markdown import supported</span></div>
      </div>
        </div>
      </div>
      {shareOpen && <ShareDialog document={document} onClose={() => setShareOpen(false)} />}
    </section>
  )
}

export function DocumentEditorPage() {
  const { id } = useParams()
  const document = useDocumentQuery(id)

  if (document.isLoading) return <div className="route-state"><LoadingNotice label="Opening document…" /></div>
  if (document.isError) return <div className="route-state"><ErrorNotice error={document.error} onRetry={() => document.refetch()} /></div>
  return <EditableDocument key={document.data._id} document={document.data} />
}
