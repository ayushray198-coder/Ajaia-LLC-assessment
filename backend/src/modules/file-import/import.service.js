import { AppError } from '../../shared/errors/AppError.js'
import { createDocument } from '../documents/document.service.js'

function importedTextToJson(text, extension) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const content = []
  let bullets = []

  const flushBullets = () => {
    if (!bullets.length) return
    content.push({ type: 'bulletList', content: bullets.map((line) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: line }] }] })) })
    bullets = []
  }

  for (const line of lines) {
    const heading = extension === '.md' ? line.match(/^(#{1,2})\s+(.+)$/) : null
    const bullet = extension === '.md' ? line.match(/^\s*[-*+]\s+(.+)$/) : null
    if (bullet) { bullets.push(bullet[1]); continue }
    flushBullets()
    if (heading) content.push({ type: 'heading', attrs: { level: heading[1].length }, content: [{ type: 'text', text: heading[2] }] })
    else if (line.trim()) content.push({ type: 'paragraph', content: [{ type: 'text', text: line }] })
    else content.push({ type: 'paragraph' })
  }
  flushBullets()
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

export async function importDocument(user, fileName, text) {
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'))
  if (!['.txt', '.md'].includes(extension)) throw new AppError(415, 'Only .txt and .md files are supported.', 'UNSUPPORTED_FILE_TYPE')
  if (text.includes('\u0000')) throw new AppError(400, 'This file does not appear to contain plain text.', 'INVALID_FILE_CONTENT')
  const title = fileName.slice(0, fileName.lastIndexOf('.')).trim().slice(0, 120) || 'Imported document'
  return createDocument(user, { title, content: importedTextToJson(text, extension) })
}
