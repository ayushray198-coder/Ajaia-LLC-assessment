export function Avatar({ user, size = 'normal' }) {
  return <span className={`avatar avatar-${size}`}>{user?.initials || user?.name?.slice(0, 2)?.toUpperCase() || 'U'}</span>
}
