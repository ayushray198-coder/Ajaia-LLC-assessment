import { useRef } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export function DocumentDownloadMenu({ onDownload }) {
  const menuRef = useRef(null)

  function download(format) {
    try {
      onDownload(format)
      menuRef.current.open = false
      toast.success(`Downloaded as .${format}`)
    } catch {
      toast.error('Could not download this document.')
    }
  }

  return (
    <details className="document-download" ref={menuRef}>
      <summary className="button button-quiet download-trigger" aria-label="Download document">
        <Download size={15} /><span>Download</span><ChevronDown size={13} />
      </summary>
      <div className="download-menu" role="group" aria-label="Download format">
        <button type="button" onClick={() => download('md')}>
          <strong>Markdown</strong><span>.md · keeps headings and lists</span>
        </button>
        <button type="button" onClick={() => download('txt')}>
          <strong>Plain text</strong><span>.txt · simple readable text</span>
        </button>
      </div>
    </details>
  )
}
