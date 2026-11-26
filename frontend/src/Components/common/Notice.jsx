import { AlertCircle, LoaderCircle } from 'lucide-react'

export function LoadingNotice({ label = 'Loading your workspace…' }) {
  return <div className="notice"><LoaderCircle className="spin" size={19} />{label}</div>
}

export function ErrorNotice({ error, onRetry }) {
  return (
    <div className="notice notice-error">
      <AlertCircle size={19} />
      <span>{error?.apiError?.message || error?.message || 'Something went wrong.'}</span>
      {onRetry && <button className="button button-quiet button-small" onClick={onRetry}>Try again</button>}
    </div>
  )
}
