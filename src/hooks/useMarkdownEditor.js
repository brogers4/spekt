import { useRef, useState } from 'react'

export function useMarkdownEditor({ onSave, allowEsc = true } = {}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef(null)
  const originalRef = useRef('')

  const textareaHeight = Math.max(256, (draft.split('\n').length + 2) * 22)
  const isDirty = draft !== originalRef.current

  function startEditing(content) {
    const initial = content ?? ''
    originalRef.current = initial
    setDraft(initial)
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  function cancelEditing() {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return
    setEditing(false)
    setDraft('')
  }

  async function save() {
    if (!onSave) return
    setSaving(true)
    await onSave(draft)
    setEditing(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); return }
    if (e.key === 'Escape' && allowEsc) { cancelEditing(); return }

    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.target
      const { selectionStart: start, selectionEnd: end, value } = el
      const INDENT = '  '

      if (e.shiftKey) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const selected = value.slice(lineStart, end)
        const dedented = selected.replace(/^  /gm, '')
        const diff = selected.length - dedented.length
        setDraft(value.slice(0, lineStart) + dedented + value.slice(end))
        requestAnimationFrame(() => {
          el.selectionStart = Math.max(start - (start > lineStart ? Math.min(2, diff) : 0), lineStart)
          el.selectionEnd = end - diff
        })
      } else if (start === end) {
        setDraft(value.slice(0, start) + INDENT + value.slice(end))
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + INDENT.length
        })
      } else {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const selected = value.slice(lineStart, end)
        const indented = selected.replace(/^/gm, INDENT)
        const diff = indented.length - selected.length
        setDraft(value.slice(0, lineStart) + indented + value.slice(end))
        requestAnimationFrame(() => {
          el.selectionStart = start + INDENT.length
          el.selectionEnd = end + diff
        })
      }
    }
  }

  return { editing, draft, setDraft, saving, saved, textareaRef, textareaHeight, startEditing, cancelEditing, save, handleKeyDown }
}
