import { useEditor, EditorContent } from '@tiptap/react'
import { createPortal } from 'react-dom'
import { Placeholder } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { EditorToolbar } from './EditorToolbar'

const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2] }, underline: false }),
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Placeholder.configure({
    placeholder: 'Start with a thought, a question, or a rough first line…',
    showOnlyWhenEditable: true,
  }),
]

export function RichTextEditor({ content, editable = true, onChange, onBlur, onOutlineChange, toolbarHost }) {
  const editor = useEditor({
    extensions,
    content,
    editable,
    immediatelyRender: false,
    editorProps: { attributes: { class: 'tiptap-content', 'aria-label': 'Document content' } },
    onUpdate: ({ editor: currentEditor }) => {
      const nextContent = currentEditor.getJSON()
      onChange(nextContent)
      onOutlineChange?.(nextContent.content.filter((node) => node.type === 'heading').map((node, index) => ({
        id: `heading-${index}`,
        level: node.attrs.level,
        text: node.content?.map((part) => part.text || '').join('') || 'Untitled heading',
      })))
    },
    onBlur: () => onBlur?.(),
  })

  return <>
    {editor && editor.isEditable && toolbarHost ? createPortal(<EditorToolbar editor={editor} />, toolbarHost) : null}
    <div className="editor-surface"><EditorContent editor={editor} /></div>
  </>
}
