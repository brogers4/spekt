import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
import { readArtifact, writeArtifact } from '../lib/fs'
import { useMarkdownEditor } from '../hooks/useMarkdownEditor'

const ARTIFACT_LABELS = {
  'prfaq.md': 'PRFAQ',
  'prd.md': 'PRD',
  'epics.md': 'Epics',
  'user-stories.md': 'User stories',
  'backlog.md': 'Backlog',
}

export default function ArtifactView() {
  const { slug, key } = useParams()
  const navigate = useNavigate()
  const { projects } = useWorkspace()
  const [content, setContent] = useState(null)
  const [generating, setGenerating] = useState(false)

  const project = projects.find((p) => p.slug === slug)
  const filename = key
  const label = ARTIFACT_LABELS[filename] ?? filename
  const { setTitle, setCrumbs } = useLayout()

  useEffect(() => {
    if (!project) return
    setTitle(label)
    setCrumbs([
      { label: 'All projects', href: '/' },
      { label: project.name, href: `/project/${slug}` },
    ])
  }, [project?.name, slug, label])

  const { editing, draft, setDraft, saving, saved, textareaRef, textareaHeight, startEditing, cancelEditing, save, handleKeyDown } = useMarkdownEditor({
    onSave: async (text) => {
      await writeArtifact(slug, filename, text)
      setContent(text)
    },
  })

  useEffect(() => {
    if (!slug || !filename) return
    readArtifact(slug, filename).then((text) => setContent(text ?? ''))
  }, [slug, filename])

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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-fg-3" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-medium text-fg-3">{filename}</span>
          </div>

          {!editing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/project/${slug}`, { state: { generateArtifact: filename } })}
                className="flex items-center gap-1.5 text-xs text-fg-3 hover:text-coral transition-colors px-2 py-1 rounded hover:bg-surface-3"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Regenerate
              </button>
              <button
                onClick={() => startEditing(content)}
                className="flex items-center gap-1.5 text-xs text-fg-3 hover:text-fg-1 transition-colors px-2 py-1 rounded hover:bg-surface-3"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </button>
            </div>
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
                <button onClick={save} disabled={saving} className="text-xs font-medium text-fg-on-accent bg-coral hover:bg-coral-hover disabled:opacity-50 px-3 py-1 rounded transition-colors">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        {editing ? (
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
          <div className="px-6 py-5 prose prose-sm prose-invert max-w-none">
            {content === null
              ? <p className="text-fg-3 italic text-sm">Loading…</p>
              : <ReactMarkdown>{content}</ReactMarkdown>}
          </div>
        )}
      </div>
    </div>
  )
}

