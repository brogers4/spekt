import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useWorkspace } from '../context/WorkspaceContext'
import { readContextFile, writeContextFile } from '../lib/fs'
import { slugify } from '../lib/fs'

const isNew = (filename) => filename === 'new'

export default function ContextNote() {
  const { slug, filename } = useParams()
  const navigate = useNavigate()
  const { handle, projects } = useWorkspace()

  const creating = isNew(filename)
  const project = projects.find((p) => p.slug === slug)

  // New note state
  const [title, setTitle] = useState('')

  // Editor state
  const [content, setContent] = useState(creating ? '' : null)
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(creating)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    if (creating) {
      setTimeout(() => titleRef.current?.focus(), 0)
      return
    }
    if (!handle || !slug) return
    readContextFile(handle, slug, filename).then((text) => {
      setContent(text ?? '')
      setDraft(text ?? '')
    })
  }, [handle, slug, filename, creating])

  function startEditing() {
    setDraft(content)
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  function cancelEditing() {
    setEditing(false)
    setDraft('')
  }

  async function save() {
    if (!handle) return
    setSaving(true)

    if (creating) {
      const fileSlug = slugify(title) || `note-${Date.now()}`
      const newFilename = `${fileSlug}.md`
      const body = `# ${title}\n\n${draft}`
      await writeContextFile(handle, slug, newFilename, body)
      setSaving(false)
      navigate(`/project/${slug}/context/${newFilename}`, { replace: true })
      return
    }

    await writeContextFile(handle, slug, filename, draft)
    setContent(draft)
    setEditing(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save() }
    if (e.key === 'Escape' && !creating) cancelEditing()
  }

  const displayTitle = creating
    ? (title || 'New Note')
    : filename.replace(/\.md$/, '').replace(/-/g, ' ')

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-gray-500">
        Project not found.{' '}
        <button onClick={() => navigate('/')} className="text-indigo-600 underline">Go home</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 flex-wrap">
        <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">All Projects</button>
        <Chevron />
        <button onClick={() => navigate(`/project/${slug}`)} className="hover:text-gray-600 transition-colors truncate">{project.name}</button>
        <Chevron />
        <button onClick={() => navigate(`/project/${slug}/context`)} className="hover:text-gray-600 transition-colors">Context</button>
        <Chevron />
        <span className="text-gray-600 capitalize truncate">{displayTitle}</span>
      </nav>

      {/* Note card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-medium text-gray-500">
              {creating ? 'new note' : filename}
            </span>
          </div>

          {!creating && (
            !editing ? (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:block">⌘S to save · Esc to cancel</span>
                <button onClick={cancelEditing} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                {saved ? (
                  <span className="text-xs text-green-600 flex items-center gap-1 px-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Saved
                  </span>
                ) : (
                  <button onClick={save} disabled={saving} className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-1 rounded transition-colors">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {/* Title field (new notes only) */}
        {creating && (
          <div className="px-6 pt-5 pb-2 border-b border-gray-100">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Tab' && (e.preventDefault(), textareaRef.current?.focus())}
              placeholder="Note title"
              className="w-full text-xl font-semibold text-gray-900 placeholder-gray-300 outline-none bg-transparent"
            />
          </div>
        )}

        {/* Body */}
        {editing || creating ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={creating ? 'Start writing…' : ''}
            className="w-full px-6 py-5 font-mono text-sm text-gray-800 leading-relaxed resize-none outline-none min-h-64 bg-white"
            style={{ height: Math.max(256, (draft.split('\n').length + 2) * 22) }}
            spellCheck={false}
          />
        ) : (
          <div className="px-6 py-5 prose prose-sm prose-gray max-w-none">
            {content === null ? (
              <p className="text-gray-400 italic text-sm">Loading…</p>
            ) : (
              <ReactMarkdown>{content}</ReactMarkdown>
            )}
          </div>
        )}

        {/* Footer (new notes only) */}
        {creating && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => navigate(`/project/${slug}/context`)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !title.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Chevron() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}
