const idOf = (value) => String(value?._id ?? value)

export function canReadDocument(document, userId) {
  const id = idOf(userId)
  return idOf(document.owner) === id || (document.sharedWith ?? []).some((sharedId) => idOf(sharedId) === id)
}

export function canEditDocument(document, userId) {
  const id = idOf(userId)
  if (idOf(document.owner) === id) return true
  const isShared = (document.sharedWith ?? []).some((sharedId) => idOf(sharedId) === id)
  if (!isShared) return false
  const permission = (document.sharedPermissions ?? []).find((entry) => idOf(entry.user) === id)
  return permission?.role !== 'viewer'
}

export function canDeleteDocument(document, userId) {
  return idOf(document.owner) === idOf(userId)
}

export function canShareDocument(document, userId) {
  return canDeleteDocument(document, userId)
}
