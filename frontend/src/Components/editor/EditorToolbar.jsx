import { useEditorState } from '@tiptap/react'
import { AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Italic, List, ListOrdered, Redo2, Underline as UnderlineIcon, Undo2 } from 'lucide-react'

export function EditorToolbar({ editor }) {
  if (!editor) return null
  return <ToolbarControls editor={editor} />
}

function ToolbarControls({ editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: activeEditor }) => ({
      bold: activeEditor.isActive('bold'), italic: activeEditor.isActive('italic'), underline: activeEditor.isActive('underline'),
      h1: activeEditor.isActive('heading', { level: 1 }), h2: activeEditor.isActive('heading', { level: 2 }),
      bullet: activeEditor.isActive('bulletList'), ordered: activeEditor.isActive('orderedList'),
      align: activeEditor.getAttributes('paragraph').textAlign || activeEditor.getAttributes('heading').textAlign || 'left',
      undo: activeEditor.can().undo(), redo: activeEditor.can().redo(),
    }),
  })
  if (!state) return null

  const button = (label, icon, active, action, disabled = false) => (
    <button type="button" className={`toolbar-button ${active ? 'is-active' : ''}`} aria-label={label} title={label} disabled={disabled} onClick={action}>{icon}</button>
  )

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
      {button('Undo', <Undo2 size={17} />, false, () => editor.chain().focus().undo().run(), !state.undo)}
      {button('Redo', <Redo2 size={17} />, false, () => editor.chain().focus().redo().run(), !state.redo)}
      <span className="toolbar-divider" />
      {button('Heading 1', <Heading1 size={18} />, state.h1, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
      {button('Heading 2', <Heading2 size={18} />, state.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
      <span className="toolbar-divider" />
      {button('Bold', <Bold size={16} />, state.bold, () => editor.chain().focus().toggleBold().run())}
      {button('Italic', <Italic size={16} />, state.italic, () => editor.chain().focus().toggleItalic().run())}
      {button('Underline', <UnderlineIcon size={16} />, state.underline, () => editor.chain().focus().toggleUnderline().run())}
      <span className="toolbar-divider" />
      {button('Bullet list', <List size={18} />, state.bullet, () => editor.chain().focus().toggleBulletList().run())}
      {button('Numbered list', <ListOrdered size={18} />, state.ordered, () => editor.chain().focus().toggleOrderedList().run())}
      <span className="toolbar-divider" />
      {button('Align left', <AlignLeft size={16} />, state.align === 'left', () => editor.chain().focus().setTextAlign('left').run())}
      {button('Align center', <AlignCenter size={16} />, state.align === 'center', () => editor.chain().focus().setTextAlign('center').run())}
      {button('Align right', <AlignRight size={16} />, state.align === 'right', () => editor.chain().focus().setTextAlign('right').run())}
      <span className="toolbar-divider" />
      {button('Clear formatting', <span className="toolbar-clear-icon">Tx</span>, false, () => editor.chain().focus().unsetAllMarks().clearNodes().run())}
      <span className="toolbar-hint">Formatting</span>
    </div>
  )
}
