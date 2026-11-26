import { FileText, MoreHorizontal, Trash2, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDeleteDocumentMutation } from '@/hooks/documents/useDocuments'
import { Avatar } from '@/Components/common/Avatar'
import { isCurrentUser } from '@/lib/auth/identity'
import toast from 'react-hot-toast'

const formatDate = (value) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))

export function DocumentRow({ document: item, auth }) {
  const navigate = useNavigate()
  const removeDocument = useDeleteDocumentMutation()
  const isOwner = isCurrentUser(item.owner, auth)

  async function remove(event) {
    event.stopPropagation()
    if (!window.confirm(`Move "${item.title}" to the trash? This cannot be undone.`)) return
    try { await removeDocument.mutateAsync(item._id); toast.success('Document deleted') }
    catch (error) { toast.error(error.apiError?.message || 'Could not delete this document.') }
  }

  return (
    <article className="document-row" role="button" tabIndex={0} onClick={() => navigate(`/documents/${item._id}`)} onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/documents/${item._id}`) }}>
      <span className="document-icon"><FileText size={19} /></span>
      <span className="document-title-cell"><strong>{item.title}</strong><small>{isOwner ? 'You' : item.owner?.name || 'Shared'}{item.sharedWith?.length ? ` · ${item.sharedWith.length} collaborator${item.sharedWith.length === 1 ? '' : 's'}` : ''}</small></span>
      <span className="document-owner"><Avatar user={item.owner} size="small" />{isOwner ? 'Me' : item.owner?.name}</span>
      <span className="document-date">{formatDate(item.updatedAt)}</span>
      <span className="document-row-actions">
        {item.sharedWith?.length > 0 && <span className="shared-indicator" title="Shared"><UsersRound size={15} /></span>}
        {isOwner && <button className="icon-button delete-button" aria-label={`Delete ${item.title}`} onClick={remove} onKeyDown={(event) => event.stopPropagation()} disabled={removeDocument.isPending}><Trash2 size={16} /></button>}
        {!isOwner && <MoreHorizontal size={17} className="row-more" />}
      </span>
    </article>
  )
}
