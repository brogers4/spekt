import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
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
  const { projects } = useWorkspace()

  const creating = filename === 'new'
  const category = creating ? 'note' : getFileCategory(decodeURIComponent(filename))
  const decodedFilename = creating ? 'new' : decodeURIComponent(filename)

  const project = projects.find((p) => p.slug === slug)
  const { setTitle: setPageTitle, setCrumbs } = useLayout()

  // New note state
  const [title, setTitle] = useState('')

  // Binary file viewer state / raw content for preview
  const [content, setContent] = useState(creating ? '' : null)
  const [objectUrl, setObjectUrl] = useState(null)

  const titleRef = useRef(null)

  const { editing, draft, setDraft, saving, saved, textareaRef, textareaHeight, startEditing, cancelEditing, save: saveExisting, handleKeyDown } = useMarkdownEditor({
    onSave: async (text) => {
      await writeContextFile(slug, decodedFilename, text)
      setContent(text)
    },
    allowEsc: !creating,
  })

  useEffect(() => {
    if (creating) { setTimeout(() => titleRef.current?.focus(), 0); return }
    if (!slug) return

    if (category === 'note' || category === 'text') {
      readContextFile(slug, decodedFilename).then((text) => {
        setContent(text ?? '')
      })
    } else {
      readContextFileAsObjectUrl(slug, decodedFilename).then((result) => {
        if (result) setObjectUrl(result.url)
      })
    }

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [slug, filename])

  async function saveNew() {
    const fileSlug = slugify(title) || `note-${Date.now()}`
    const newFilename = `${fileSlug}.md`
    await writeContextFile(slug, newFilename, `# ${title}\n\n${draft}`)
    navigate(`/project/${slug}/context/${newFilename}`, { replace: true })
  }

  function handleKeyDownNew(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveNew(); return }
    handleKeyDown(e)
  }

  const displayTitle = creating
    ? (title || 'New note')
    : decodedFilename.replace(/-/g, ' ')

  useEffect(() => {
    if (!project) return
    setPageTitle(displayTitle)
    setCrumbs([
      { label: 'All projects', href: '/projects' },
      { label: project.name, href: `/project/${slug}` },
      { label: 'Context', href: `/project/${slug}/context` },
    ])
  }, [project?.name, slug, displayTitle])

  if (!project) {
    return (
      <div className="max-w-[720px] mx-auto py-16 px-8 text-fg-3">
        Project not found.{' '}
        <button onClick={() => navigate('/')} className="text-coral underline">Go home</button>
      </div>
    )
  }

  return (
    <div className="max-w-[720px] mx-auto py-10 px-8">
      <div className="rounded-lg border border-border bg-surface-2 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-fg-3" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-medium text-fg-3">{creating ? 'new note' : decodedFilename}</span>
          </div>

          {/* Edit controls — only for notes and text files */}
          {(category === 'note' || category === 'text') && !creating && (
            !editing ? (
              <button onClick={() => startEditing(content)} className="flex items-center gap-1.5 text-xs text-fg-3 hover:text-fg-1 transition-colors px-2 py-1 rounded hover:bg-surface-3">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-3 hidden sm:block">⌘S to save · Esc to cancel</span>
                <button onClick={cancelEditing} className="text-xs text-fg-3 hover:text-fg-2 px-2 py-1 rounded hover:bg-surface-3 transition-colors">Cancel</button>
                {saved ? (
                  <span className="text-xs text-success flex items-center gap-1 px-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Saved
                  </span>
                ) : (
                  <button onClick={saveExisting} disabled={saving} className="text-xs font-medium text-fg-on-accent bg-coral hover:bg-coral-hover disabled:opacity-50 px-3 py-1 rounded transition-colors">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {/* Title input for new notes */}
        {creating && (
          <div className="px-6 pt-5 pb-2 border-b border-border">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Tab' && (e.preventDefault(), textareaRef.current?.focus())}
              placeholder="Note title"
              className="w-full text-xl font-semibold text-fg-1 placeholder-fg-4 outline-none bg-transparent"
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
            className="w-full px-6 py-5 font-mono text-sm text-fg-1 leading-relaxed resize-none outline-none min-h-64 bg-surface-2"
            style={{ height: textareaHeight }}
            spellCheck={false}
          />
        ) : category === 'note' ? (
          <div className="px-6 py-5 prose prose-sm prose-invert max-w-none">
            {content === null
              ? <p className="text-fg-3 italic text-sm">Loading…</p>
              : <ReactMarkdown>{content}</ReactMarkdown>}
          </div>
        ) : category === 'text' ? (
          editing ? (
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-6 py-5 font-mono text-sm text-fg-1 leading-relaxed resize-none outline-none min-h-64 bg-surface-2"
              style={{ height: textareaHeight }}
              spellCheck={false}
            />
          ) : (
            <pre className="px-6 py-5 text-sm text-fg-1 font-mono whitespace-pre-wrap overflow-x-auto">
              {content === null ? <span className="text-fg-3 italic">Loading…</span> : content}
            </pre>
          )
        ) : category === 'image' ? (
          <div className="flex items-center justify-center p-6 bg-surface-1 min-h-48">
            {objectUrl
              ? <img src={objectUrl} alt={decodedFilename} className="max-w-full max-h-[70vh] rounded object-contain" />
              : <p className="text-sm text-fg-3">Loading…</p>}
          </div>
        ) : category === 'pdf' ? (
          <div className="min-h-[70vh]">
            {objectUrl
              ? <iframe src={objectUrl} title={decodedFilename} className="w-full h-[70vh] border-0" />
              : <div className="flex items-center justify-center h-48 text-sm text-fg-3">Loading…</div>}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-fg-3">
            <svg className="w-8 h-8 mx-auto mb-3 text-fg-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm font-medium text-fg-3">No preview available</p>
            <p className="text-xs mt-1">This file is stored in your context folder and will be available to the agent when generating artifacts.</p>
          </div>
        )}

        {/* Footer for new notes */}
        {creating && (
          <div className="px-6 py-4 bg-surface-1 border-t border-border flex items-center justify-between">
            <button onClick={() => navigate(`/project/${slug}/context`)} className="text-sm text-fg-3 hover:text-fg-2 transition-colors">Cancel</button>
            <button
              onClick={saveNew}
              disabled={!title.trim()}
              className="rounded-lg bg-coral px-5 py-2 text-sm font-medium text-fg-on-accent hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

