import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
import { readArtifact, writeArtifact, deleteArtifact, readPrdReview, writePrdReview } from '../lib/fs'
import { revisePrdFromFeedback, incrementPrdRevision } from '../lib/claude'
import { useMarkdownEditor } from '../hooks/useMarkdownEditor'

const ARTIFACT_LABELS = {
  'prfaq': 'PRFAQ',
  'prd': 'PRD',
  'epics': 'Epics',
  'user-stories': 'User stories',
  'backlog': 'Backlog',
}

const TYPE_CHIP_STYLES = {
  question: 'bg-blue-500/10 text-blue-400',
  gap: 'bg-amber-500/10 text-amber-400',
  decision: 'bg-purple-500/10 text-purple-400',
}

function ReviewPanel({ items, onDismiss, onSubmitFeedback }) {
  const active = items.filter((i) => !i.dismissed)
  const [idx, setIdx] = useState(0)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [processingId, setProcessingId] = useState(null) // id of item being revised in background
  const processingAbort = useRef(null)

  useEffect(() => {
    if (idx >= active.length && active.length > 0) setIdx(active.length - 1)
    setFeedbackOpen(false)
    setFeedbackText('')
  }, [active.length])

  if (active.length === 0) return null

  const current = Math.min(idx, active.length - 1)
  const item = active[current]

  const dismiss = async (id) => {
    await onDismiss(id)
    setFeedbackOpen(false)
    setFeedbackText('')
  }

  const submitFeedback = async () => {
    if (!feedbackText.trim() || processingId) return
    const targetId = item.id
    const text = feedbackText
    setFeedbackOpen(false)
    setFeedbackText('')
    setProcessingId(targetId)
    processingAbort.current = new AbortController()
    try {
      await onSubmitFeedback(item, text, processingAbort.current.signal)
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Feedback revision failed', e)
    } finally {
      setProcessingId(null)
      processingAbort.current = null
    }
  }

  const cancelProcessing = () => {
    processingAbort.current?.abort()
    setProcessingId(null)
  }

  const isProcessing = !!processingId

  return (
    <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <>
              <svg className="w-4 h-4 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold text-amber-400">Revising PRD…</span>
              <button
                onClick={cancelProcessing}
                className="text-xs text-amber-500 hover:text-amber-300 underline transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="text-sm font-semibold text-amber-400">Needs your review</span>
              <span className="text-xs font-medium text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {active.length} {active.length === 1 ? 'item' : 'items'}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-fg-3 mr-1">{current + 1} of {active.length}</span>
          <button
            onClick={() => setIdx((i) => (i - 1 + active.length) % active.length)}
            disabled={active.length <= 1}
            className="w-6 h-6 flex items-center justify-center rounded text-fg-3 hover:text-fg-1 hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % active.length)}
            disabled={active.length <= 1}
            className="w-6 h-6 flex items-center justify-center rounded text-fg-3 hover:text-fg-1 hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_CHIP_STYLES[item.type] ?? 'bg-surface-3 text-fg-3'}`}>
            {item.type}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-fg-1 leading-snug">{item.title}</p>
            <p className="text-xs text-fg-3 mt-1 leading-relaxed">{item.detail}</p>
            {isProcessing && processingId === item.id && (
              <p className="text-xs text-amber-400/70 mt-1 italic">Revising PRD based on your feedback…</p>
            )}
          </div>
        </div>

        {feedbackOpen ? (
          <div className="mt-4">
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Describe how to address this…"
              rows={3}
              autoFocus
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-fg-1 placeholder:text-fg-4 resize-none outline-none focus:border-border-strong transition-colors"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => { setFeedbackOpen(false); setFeedbackText('') }}
                className="text-xs text-fg-3 hover:text-fg-2 px-2 py-1 rounded hover:bg-surface-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={!feedbackText.trim() || isProcessing}
                className="text-xs font-medium text-fg-on-accent bg-coral hover:bg-coral-hover disabled:opacity-50 px-3 py-1 rounded transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => dismiss(item.id)}
              disabled={isProcessing}
              className="text-xs text-fg-3 hover:text-fg-1 px-3 py-1.5 rounded-md border border-border hover:border-border-strong hover:bg-surface-3 disabled:opacity-40 transition-colors"
            >
              Looks good
            </button>
            <button
              onClick={() => dismiss(item.id)}
              disabled={isProcessing}
              className="text-xs text-fg-3 hover:text-fg-1 px-3 py-1.5 rounded-md border border-border hover:border-border-strong hover:bg-surface-3 disabled:opacity-40 transition-colors"
            >
              Ignore for now
            </button>
            <button
              onClick={() => !isProcessing && setFeedbackOpen(true)}
              disabled={isProcessing}
              title={isProcessing ? 'A revision is already in progress' : undefined}
              className="text-xs font-medium text-coral hover:text-coral-hover px-3 py-1.5 rounded-md border border-coral/30 hover:border-coral/60 hover:bg-coral/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Give feedback
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ArtifactView() {
  const { slug, key } = useParams()
  const navigate = useNavigate()
  const { projects } = useWorkspace()
  const [content, setContent] = useState(null)
  const [reviewItems, setReviewItems] = useState([])
  const [showRevisionPrompt, setShowRevisionPrompt] = useState(false)
  const [revisionLoading, setRevisionLoading] = useState(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const contentBeforeEdit = useRef(null)

  const project = projects.find((p) => p.slug === slug)
  const filename = key
  const type = filename.startsWith(`${slug}-`)
    ? filename.slice(slug.length + 1).replace(/\.md$/, '')
    : filename.replace(/\.md$/, '')
  const label = ARTIFACT_LABELS[type] ?? type
  const isPrd = type === 'prd'
  const { setTitle, setCrumbs, setBack } = useLayout()

  useEffect(() => {
    if (!project) return
    setTitle(label)
    setCrumbs([
      { label: 'All projects', href: '/projects' },
      { label: project.name, href: `/project/${slug}` },
    ])
    setBack(`/project/${slug}`)
  }, [project?.name, slug, label])

  const { editing, draft, setDraft, saving, saved, textareaRef, textareaHeight, startEditing: _startEditing, cancelEditing, save, handleKeyDown } = useMarkdownEditor({
    onSave: async (text) => {
      await writeArtifact(slug, filename, text)
      setContent(text)
      if (isPrd) setShowRevisionPrompt(true)
    },
  })

  const startEditing = (text) => {
    contentBeforeEdit.current = text
    _startEditing(text)
  }

  useEffect(() => {
    if (!slug || !filename) return
    readArtifact(slug, filename).then((text) => setContent(text ?? ''))
    if (isPrd) {
      readPrdReview(slug).then(setReviewItems)
    }
  }, [slug, filename])

  const dismissItem = async (id) => {
    const updated = reviewItems.map((i) => i.id === id ? { ...i, dismissed: true } : i)
    setReviewItems(updated)
    await writePrdReview(slug, updated)
  }

  const handleFeedback = async (item, feedbackText, signal) => {
    const revised = await revisePrdFromFeedback({
      prdContent: content,
      reviewItem: item,
      feedback: feedbackText,
      signal,
    })
    await writeArtifact(slug, filename, revised)
    setContent(revised)
    await dismissItem(item.id)
  }

  const applyRevision = async () => {
    setRevisionLoading(true)
    try {
      const revised = await incrementPrdRevision({
        contentBefore: contentBeforeEdit.current ?? '',
        contentAfter: content,
        signal: new AbortController().signal,
      })
      await writeArtifact(slug, filename, revised)
      setContent(revised)
    } catch (e) {
      console.error('Revision increment failed', e)
    } finally {
      setRevisionLoading(false)
      setShowRevisionPrompt(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteArtifact(slug, filename)
      if (isPrd) {
        // Also delete the review sidecar
        try { await deleteArtifact(slug, `${slug}-prd-review.json`) } catch { /* ignore */ }
      }
      navigate(`/project/${slug}`)
    } catch (e) {
      console.error('Delete failed', e)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (!project) {
    return (
      <div className="max-w-[720px] mx-auto py-16 px-8 text-fg-3">
        Project not found.{' '}
        <button onClick={() => navigate('/')} className="text-coral underline">Go home</button>
      </div>
    )
  }

  const activeReviewItems = reviewItems.filter((i) => !i.dismissed)

  return (
    <div className="max-w-[720px] mx-auto py-10 px-8">
      {isPrd && activeReviewItems.length > 0 && (
        <ReviewPanel
          items={reviewItems}
          onDismiss={dismissItem}
          onSubmitFeedback={handleFeedback}
        />
      )}

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
              {confirmRegenerate ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fg-3">Regenerating will erase all revision history.</span>
                  <button
                    onClick={() => setConfirmRegenerate(false)}
                    className="text-xs text-fg-3 hover:text-fg-2 px-2 py-1 rounded hover:bg-surface-3 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setConfirmRegenerate(false); navigate(`/project/${slug}`, { state: { generateArtifact: filename } }) }}
                    className="text-xs font-medium text-fg-on-accent bg-coral hover:bg-coral-hover px-3 py-1 rounded transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              ) : confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-danger">Delete this {label}? This cannot be undone.</span>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-fg-3 hover:text-fg-2 px-2 py-1 rounded hover:bg-surface-3 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs font-medium text-white bg-danger hover:bg-danger/80 disabled:opacity-50 px-3 py-1 rounded transition-colors"
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    title="Delete artifact"
                    className="flex items-center gap-1.5 text-xs text-fg-3 hover:text-danger transition-colors px-2 py-1 rounded hover:bg-surface-3"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmRegenerate(true)}
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
                </>
              )}
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

        {/* Revision prompt banner */}
        {showRevisionPrompt && !editing && (
          <div className="px-4 py-3 border-b border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-4">
            <p className="text-sm text-fg-2">Increment revision number and log this change?</p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowRevisionPrompt(false)}
                className="text-xs text-fg-3 hover:text-fg-2 px-2 py-1 rounded hover:bg-surface-3 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={applyRevision}
                disabled={revisionLoading}
                className="text-xs font-medium text-fg-on-accent bg-coral hover:bg-coral-hover disabled:opacity-50 px-3 py-1 rounded transition-colors"
              >
                {revisionLoading ? 'Updating…' : 'Yes, increment'}
              </button>
            </div>
          </div>
        )}

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
              : <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>}
          </div>
        )}
      </div>
    </div>
  )
}
