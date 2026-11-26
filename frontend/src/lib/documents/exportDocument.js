function inlineText(node, format) {
  if (node.type === 'hardBreak') return '\n'
  if (node.type !== 'text') return (node.content || []).map((child) => inlineText(child, format)).join('')

  let text = node.text || ''
  if (format === 'text') return text

  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const markdownSpecial = new Set(['\\', '`', '*', '_', '{', '}', '[', ']', '(', ')', '#', '+', '.', '!', '|', '>', '~', '-'])
  text = [...text].map((character) => markdownSpecial.has(character) ? `\\${character}` : character).join('')
  for (const mark of node.marks || []) {
    if (mark.type === 'bold') text = `**${text}**`
    if (mark.type === 'italic') text = `_${text}_`
    if (mark.type === 'strike') text = `~~${text}~~`
    if (mark.type === 'underline') text = `<u>${text}</u>`
    if (mark.type === 'code') text = `\`${(node.text || '').replace(/`/g, '\\`')}\``
  }
  return text
}

function markdownList(list, depth = 0) {
  const ordered = list.type === 'orderedList'
  const start = Number(list.attrs?.start) || 1

  return (list.content || []).map((item, index) => {
    const blocks = item.content || []
    const firstBlock = blocks[0]
    const marker = ordered ? `${start + index}.` : '-'
    const prefix = `${'  '.repeat(depth)}${marker} `
    const first = firstBlock?.type === 'paragraph' ? inlineText(firstBlock, 'markdown') : ''
    const nested = blocks.slice(firstBlock?.type === 'paragraph' ? 1 : 0).map((block) => {
      if (block.type === 'bulletList' || block.type === 'orderedList') return markdownList(block, depth + 1)
      return `${'  '.repeat(depth + 1)}${markdownBlock(block)}`
    }).filter(Boolean)
    return [prefix + first, ...nested].join('\n')
  }).join('\n')
}

function markdownBlock(node) {
  if (node.type === 'paragraph') return inlineText(node, 'markdown')
  if (node.type === 'heading') return `${'#'.repeat(node.attrs?.level || 1)} ${inlineText(node, 'markdown')}`
  if (node.type === 'bulletList' || node.type === 'orderedList') return markdownList(node)
  if (node.type === 'blockquote') return (node.content || []).map(markdownBlock).join('\n\n').split('\n').map((line) => `> ${line}`).join('\n')
  if (node.type === 'codeBlock') {
    const code = (node.content || []).map((child) => child.text || '').join('')
    const longestFence = Math.max(0, ...(code.match(/`+/g) || []).map((fence) => fence.length))
    const fence = '`'.repeat(Math.max(3, longestFence + 1))
    return `${fence}\n${code}\n${fence}`
  }
  if (node.type === 'horizontalRule') return '---'
  return inlineText(node, 'markdown')
}

function textList(list, depth = 0) {
  const ordered = list.type === 'orderedList'
  const start = Number(list.attrs?.start) || 1

  return (list.content || []).map((item, index) => {
    const blocks = item.content || []
    const firstBlock = blocks[0]
    const marker = ordered ? `${start + index}.` : '•'
    const prefix = `${'  '.repeat(depth)}${marker} `
    const first = firstBlock?.type === 'paragraph' ? inlineText(firstBlock, 'text') : ''
    const nested = blocks.slice(firstBlock?.type === 'paragraph' ? 1 : 0).map((block) => {
      if (block.type === 'bulletList' || block.type === 'orderedList') return textList(block, depth + 1)
      return `${'  '.repeat(depth + 1)}${plainTextBlock(block)}`
    }).filter(Boolean)
    return [prefix + first, ...nested].join('\n')
  }).join('\n')
}

function plainTextBlock(node) {
  if (node.type === 'bulletList' || node.type === 'orderedList') return textList(node)
  if (node.type === 'blockquote') return (node.content || []).map(plainTextBlock).join('\n').split('\n').map((line) => `  ${line}`).join('\n')
  if (node.type === 'horizontalRule') return '──────────'
  return inlineText(node, 'text')
}

export function serializeDocument(content, format) {
  const blocks = content?.content || []
  return blocks.map((block) => format === 'markdown' ? markdownBlock(block) : plainTextBlock(block)).join(format === 'markdown' ? '\n\n' : '\n\n').trimEnd()
}

function safeFileName(title) {
  return (title || 'Draftly document')
    .trim()
    .replace(/[<>:"/\\|?*]/g, '-')
    .split('').filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join('')
    .replace(/[. ]+$/g, '')
    .slice(0, 100) || 'Draftly document'
}

export function downloadDocument({ title, content, format }) {
  const isMarkdown = format === 'md'
  const mimeType = isMarkdown ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8'
  const body = serializeDocument(content, isMarkdown ? 'markdown' : 'text')
  const blob = new Blob([body], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = `${safeFileName(title)}.${format}`
  window.document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
