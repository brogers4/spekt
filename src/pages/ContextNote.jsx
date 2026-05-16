import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useWorkspace } from '../context/WorkspaceContext'
import { readContextFile, writeContextFile, readContextFileAsObjectUrl, slugify } from '../lib/fs'
import { useMarkdownEditor } from '../hooks/useMarkdownEditor'

function getFileCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'md') return 'note'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['txt', 'csv', 'json', 'xml', 'html', 'js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'sh', 'yaml', 'yml'].includes(ext)) return 'text'
  return 'other'
}

export default function ContextNote() {
  const { slug, filename } = useParams()
  const navigate = useNavigate()
  const { handle, projects } = useWorkspace()

  const creating = filename === 'new'
  const category = creating ? 'note' : getFileCategory(decodeURIComponent(filename))
  const decodedFilename = creating ? 'new' : decodeURIComponent(filename)

  const project = projects.find((p) => p.slug === slug)

  // New note state
  const [title, setTitle] = useState('')

  // Binary file viewer state / raw content for preview
  const [content, setContent] = useState(creating ? '' : null)
  const [objectUrl, setObjectUrl] = useState(null)

  const titleRef = useRef(null)

  const { editing, draft, setDraft, saving, saved, textareaRef, textareaHeight, startEditing, cancelEditing, save: saveExisting, handleKeyDown } = useMarkdownEditor({
    onSave: async (text) => {
      await writeContextFile(handle, slug, decodedFilename, text)
      setContent(text)
    },
    allowEsc: !creating,
  })

  useEffect(() => {
    if (creating) { setTimeout(() => titleRef.current?.focus(), 0); return }
    if (!handle || !slug) return

    if (category === 'note' || category === 'text') {
      readContextFile(handle, slug, decodedFilename).then((text) => {
        setContent(text ?? '')
      })
    } else {
      readContextFileAsObjectUrl(handle, slug, decodedFilename).then((result) => {
        if (result) setObjectUrl(result.url)
      })
    }

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [handle, slug, filename])

  async function saveNew() {
    if (!handle) return
    const fileSlug = slugify(title) || `note-${Date.now()}`
    const newFilename = `${fileSlug}.md`
    await writeContextFile(handle, slug, newFilename, `# ${title}\n\n${draft}`)
    navigate(`/project/${slug}/context/${newFilename}`, { replace: true })
  }

  function handleKeyDownNew(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveNew(); return }
    handleKeyDown(e)
  }

  const displayTitle = creating
    ? (title || 'New Note')
    : decodedFilename.replace(/-/g, ' ')

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
        <span className="text-gray-600 truncate">{displayTitle}</span>
      </nav>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-medium text-gray-500">{creating ? 'new note' : decodedFilename}</span>
          </div>

          {/* Edit controls — only for notes and text files */}
          {(category === 'note' || category === 'text') && !creating && (
            !editing ? (
              <button onClick={() => startEditing(content)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:block">⌘S to save · Esc to cancel</span>
                <button onClick={cancelEditing} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors">Cancel</button>
                {saved ? (
                  <span className="text-xs text-green-600 flex items-center gap-1 px-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Saved
                  </span>
                ) : (
                  <button onClick={saveExisting} disabled={saving} className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-1 rounded transition-colors">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {/* Title input for new notes */}
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

        {/* Body — varies by file type */}
        {(category === 'note') && (editing || creating) ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={creating ? handleKeyDownNew : handleKeyDown}
            placeholder={creating ? 'Start writing…' : ''}
            className="w-full px-6 py-5 font-mono text-sm text-gray-800 leading-relaxed resize-none outline-none min-h-64 bg-white"
            style={{ height: textareaHeight }}
            spellCheck={false}
          />
        ) : category === 'note' ? (
          <div className="px-6 py-5 prose prose-sm prose-gray max-w-none">
            {content === null
              ? <p className="text-gray-400 italic text-sm">Loading…</p>
              : <ReactMarkdown>{content}</ReactMarkdown>}
          </div>
        ) : category === 'text' ? (
          editing ? (
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-6 py-5 font-mono text-sm text-gray-800 leading-relaxed resize-none outline-none min-h-64 bg-white"
              style={{ height: textareaHeight }}
              spellCheck={false}
            />
          ) : (
            <pre className="px-6 py-5 text-sm text-gray-800 font-mono whitespace-pre-wrap overflow-x-auto">
              {content === null ? <span className="text-gray-400 italic">Loading…</span> : content}
            </pre>
          )
        ) : category === 'image' ? (
          <div className="flex items-center justify-center p-6 bg-gray-50 min-h-48">
            {objectUrl
              ? <img src={objectUrl} alt={decodedFilename} className="max-w-full max-h-[70vh] rounded object-contain" />
              : <p className="text-sm text-gray-400">Loading…</p>}
          </div>
        ) : category === 'pdf' ? (
          <div className="min-h-[70vh]">
            {objectUrl
              ? <iframe src={objectUrl} title={decodedFilename} className="w-full h-[70vh] border-0" />
              : <div className="flex items-center justify-center h-48 text-sm text-gray-400">Loading…</div>}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No preview available</p>
            <p className="text-xs mt-1">This file is stored in your context folder and will be available to Claude when generating artifacts.</p>
          </div>
        )}

        {/* Footer for new notes */}
        {creating && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => navigate(`/project/${slug}/context`)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
            <button
              onClick={saveNew}
              disabled={!title.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save Note
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
