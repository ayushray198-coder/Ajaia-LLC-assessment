import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Check, ClipboardCopy, Link2, LoaderCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { Avatar } from '@/Components/common/Avatar'
import { useDemoUsersQuery } from '@/hooks/users/useDemoUsersQuery'
import { useRevokeShareMutation, useShareDocumentMutation, useUpdateShareRoleMutation } from '@/hooks/documents/useDocuments'
import { isCurrentUser } from '@/lib/auth/identity'

const schema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, 'Choose a person to share with.'),
  role: z.enum(['viewer', 'editor']),
})

function getRole(document, userId) {
  const permission = document.sharedPermissions?.find((entry) => String(entry.user?._id || entry.user) === String(userId))
  return permission?.role || 'editor'
}

async function copyCurrentLink() {
  const link = window.location.href
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(link)
    return
  }
  const input = window.document.createElement('textarea')
  input.value = link
  input.style.position = 'fixed'
  input.style.opacity = '0'
  window.document.body.append(input)
  input.select()
  const copied = window.document.execCommand('copy')
  input.remove()
  if (!copied) throw new Error('Clipboard unavailable')
}

export function ShareDialog({ document, onClose }) {
  const auth = useSelector((state) => state.auth)
  const users = useDemoUsersQuery()
  const share = useShareDocumentMutation(document._id)
  const revoke = useRevokeShareMutation(document._id)
  const updateRole = useUpdateShareRoleMutation(document._id)
  const sharedIds = new Set((document.sharedWith || []).map((user) => String(user._id)))
  const choices = (users.data || []).filter((user) => !isCurrentUser(user, auth) && !sharedIds.has(String(user._id)))
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { userId: '', role: 'editor' },
  })

  useEffect(() => {
    const previousOverflow = window.document.body.style.overflow
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose() }
    window.document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  async function submit({ userId, role }) {
    try {
      await share.mutateAsync({ userId, role })
      reset({ userId: '', role })
      toast.success(role === 'viewer' ? 'Viewer invited' : 'Editor invited')
    } catch (error) { toast.error(error.apiError?.message || 'Could not share this document.') }
  }

  async function remove(user) {
    try { await revoke.mutateAsync({ userId: user._id }); toast.success(`Access removed for ${user.name}`) }
    catch (error) { toast.error(error.apiError?.message || 'Could not update sharing.') }
  }

  async function changeRole(user, role) {
    try {
      await updateRole.mutateAsync({ userId: user._id, role })
      toast.success(`Access changed to ${role}`)
    } catch (error) { toast.error(error.apiError?.message || 'Could not change access.') }
  }

  async function copyLink() {
    try {
      await copyCurrentLink()
      toast.success('Document link copied')
    } catch { toast.error('Could not copy the link. Check clipboard permissions.') }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-heading" aria-describedby="share-description">
        <header className="modal-header">
          <div><span className="modal-icon"><Link2 size={18} /></span><div><h2 id="share-heading">Share document</h2><p id="share-description">Invite people to view or edit {document.title}.</p></div></div>
          <button className="icon-button" type="button" aria-label="Close sharing" onClick={onClose}><X size={18} /></button>
        </header>

        <form className="share-form" onSubmit={handleSubmit(submit)}>
          <label htmlFor="share-user">Add people</label>
          <div className="share-input-row">
            <select id="share-user" autoFocus {...register('userId')}>
              <option value="">Select a person</option>
              {choices.map((user) => <option value={user._id} key={user._id}>{user.name} · {user.email}</option>)}
            </select>
            <select aria-label="Access for invited person" {...register('role')}>
              <option value="editor">Can edit</option>
              <option value="viewer">Can view</option>
            </select>
            <button className="button button-primary" type="submit" disabled={share.isPending || !choices.length}>
              {share.isPending ? <LoaderCircle className="spin" size={16} /> : null}Share
            </button>
          </div>
          {errors.userId && <p className="field-error">{errors.userId.message}</p>}
          {!users.isLoading && users.isError && <p className="field-error">Could not load people. Try closing and reopening sharing.</p>}
          {!users.isLoading && !users.isError && !choices.length && <p className="modal-footnote">Everyone in your workspace already has access.</p>}
        </form>

        <div className="shared-list">
          <div className="shared-list-title">People with access <span>{(document.sharedWith || []).length + 1}</span></div>
          <div className="person-row"><Avatar user={document.owner} /><div className="person-copy"><strong>{document.owner?.name} (you)</strong><small>{document.owner?.email}</small></div><span className="role-label">Owner</span></div>
          {(document.sharedWith || []).map((user) => (
            <div className="person-row" key={user._id}>
              <Avatar user={user} />
              <div className="person-copy"><strong>{user.name}</strong><small>{user.email}</small></div>
              <select className="share-role-select" aria-label={`Access for ${user.name}`} value={getRole(document, user._id)} onChange={(event) => changeRole(user, event.target.value)} disabled={updateRole.isPending}>
                <option value="editor">Can edit</option>
                <option value="viewer">Can view</option>
              </select>
              <button className="button button-quiet button-small" type="button" onClick={() => remove(user)} disabled={revoke.isPending} aria-label={`Remove ${user.name}`} title="Remove access">Remove</button>
            </div>
          ))}
        </div>

        <footer className="modal-footer">
          <span>Only invited people can open this link.</span>
          <div><button className="button button-quiet button-small copy-link-button" type="button" onClick={copyLink}><ClipboardCopy size={14} />Copy link</button><button className="button button-secondary" type="button" onClick={onClose}><Check size={14} />Done</button></div>
        </footer>
      </section>
    </div>
  )
}
