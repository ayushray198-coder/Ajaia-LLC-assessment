import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useImportDocumentMutation } from '@/hooks/documents/useImportDocumentMutation'

export function FileImportButton({ compact = false }) {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const importDocument = useImportDocumentMutation()

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!/\.(txt|md)$/i.test(file.name)) return toast.error('Choose a .txt or .md file.')
    if (file.size > 1_000_000) return toast.error('Files must be 1 MB or smaller.')
    try {
      const document = await importDocument.mutateAsync({ fileName: file.name, content: await file.text() })
      toast.success('File imported')
      navigate(`/documents/${document._id}`)
    } catch (error) { toast.error(error.apiError?.message || 'Could not import this file.') }
  }

  return <>
    <input ref={inputRef} type="file" accept=".txt,.md,text/plain,text/markdown" hidden onChange={handleFile} />
    <button className={`button ${compact ? 'button-quiet' : 'button-secondary'}`} onClick={() => inputRef.current?.click()} disabled={importDocument.isPending}>
      <FileUp size={16} />{importDocument.isPending ? 'Importing…' : 'Import file'}
    </button>
  </>
}
