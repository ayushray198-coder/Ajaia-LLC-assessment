export function getAuthIdentity(auth) {
  return auth.user?._id || auth.demoId || 'anonymous'
}

export function isCurrentUser(user, auth) {
  if (auth.user?._id) return String(user?._id) === String(auth.user._id)
  return Boolean(auth.demoId && user?.demoId === auth.demoId)
}

export function getDocumentRole(document, auth) {
  if (isCurrentUser(document.owner, auth)) return 'owner'
  const permission = document.sharedPermissions?.find((entry) => isCurrentUser(entry.user, auth))
  if (permission) return permission.role
  return (document.sharedWith || []).some((user) => isCurrentUser(user, auth)) ? 'editor' : null
}
