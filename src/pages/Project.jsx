import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
import { readArtifact, writeArtifact, listContextFiles, getFileLastModified } from '../lib/fs'
import { useMarkdownEditor } from '../hooks/useMarkdownEditor'
import GenerateArtifactModal from '../components/GenerateArtifactModal'
import CLIInstructionsModal from '../components/CLIInstructionsModal'
import { getCliMode } from '../lib/claude'

const ARTIFACT_TYPES = [
  { type: 'prfaq', label: 'PRFAQ', description: 'Press Release & FAQ', hasTemplate: true },
  { type: 'prd', label: 'PRD', description: 'Product Requirements Document', hasTemplate: true },
  { type: 'epics', label: 'Epics', description: 'High-level feature groupings', hasTemplate: false },
  { type: 'user-stories', label: 'User stories', description: 'Granular development tasks', hasTemplate: false },
  { type: 'backlog', label: 'Backlog', description: 'Prioritized work queue', hasTemplate: false },
]

function artifactFilename(slug, type) {
  return `${slug}-${type}.md`
}

export default function Project() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { projects } = useWorkspace()
  const [readme, setReadme] = useState(null)
  const [artifactStatus, setArtifactStatus] = useState({})
  const [contextCount, setContextCount] = useState(null)
  const [lastModified, setLastModified] = useState(null)
  const [generatingArtifact, setGeneratingArtifact] = useState(null)

  const project = projects.find((p) => p.slug === slug)
  const { setTitle, setCrumbs, setBack } = useLayout()

  useEffect(() => {
    if (!project) return
    setTitle(project.name)
    setCrumbs([{ label: 'All projects', href: '/projects' }])
    setBack('/projects')
  }, [project?.name])

  const { editing, draft, setDraft, saving, saved, textareaRef, textareaHeight, startEditing, cancelEditing, save, handleKeyDown } = useMarkdownEditor({
    onSave: async (content) => {
      await writeArtifact(slug, 'README.md', content)
      setReadme(content)
    },
  })

  useEffect(() => {
    if (!slug) return
    readArtifact(slug, 'README.md').then(setReadme)
    getFileLastModified(slug, 'README.md').then(setLastModified)
    listContextFiles(slug).then((files) => setContextCount(files.length))
    Promise.all(
      ARTIFACT_TYPES.map(async ({ type }) => {
        const key = artifactFilename(slug, type)
        const content = await readArtifact(slug, key)
        return [key, content !== null]
      })
    ).then((entries) => setArtifactStatus(Object.fromEntries(entries)))
  }, [slug])

  useEffect(() => {
    if (location.state?.generateArtifact) {
      setGeneratingArtifact(location.state.generateArtifact)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state])

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-fg-3">
        Project not found.{' '}
        <button onClick={() => navigate('/')} className="text-coral underline">
          Go home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-[720px] mx-auto py-10 px-8">
      {/* Project header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-fg-1 leading-tight">{project.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-xs text-fg-3 bg-surface-3 px-2 py-0.5 rounded">
              {project.slug}
            </span>
            {lastModified && (
              <span className="text-xs text-fg-3">
                Updated {new Date(lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate(`/project/${slug}/settings`)}
          title="Project settings"
          className="mt-0.5 p-1.5 rounded-md text-fg-3 hover:text-fg-2 hover:bg-surface-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
      </div>

      {/* README card */}
      <div className="rounded-lg border border-border bg-surface-2 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-fg-3" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-medium text-fg-3">README.md</span>
          </div>

          {/* Edit / Save / Cancel controls */}
          {!editing ? (
            <button
              onClick={() => startEditing(readme)}
              className="flex items-center gap-1.5 text-xs text-fg-3 hover:text-fg-1 transition-colors px-2 py-1 rounded hover:bg-surface-3"
            >
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
                <button
                  onClick={save}
                  disabled={saving}
                  className="text-xs font-medium text-fg-on-accent bg-coral hover:bg-coral-hover disabled:opacity-50 px-3 py-1 rounded transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              )}
            </div>
          )}
        </div>

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
            {readme === null ? (
              <p className="text-fg-3 text-sm italic">Loading…</p>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
            )}
          </div>
        )}
      </div>

      {/* Context */}
      <button
        onClick={() => navigate(`/project/${slug}/context`)}
        className="mt-6 w-full flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3.5 shadow-sm hover:border-border-strong hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-fg-3 group-hover:text-coral transition-colors" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <div className="text-left">
            <p className="text-sm font-medium text-fg-1">Context</p>
            <p className="text-xs text-fg-3">
              {contextCount === null ? 'Loading…' : contextCount === 0 ? 'No files yet' : `${contextCount} file${contextCount === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        <svg className="w-4 h-4 text-fg-4 group-hover:text-coral transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Artifacts */}
      <h2 className="mt-10 text-sm font-semibold text-fg-3 uppercase tracking-wide">
        Artifacts
      </h2>
      <div className="mt-3 space-y-2">
        {ARTIFACT_TYPES.map(({ type, label, description, hasTemplate }) => {
          const key = artifactFilename(slug, type)
          const generated = artifactStatus[key]
          const clickable = generated || hasTemplate

          if (clickable) {
            return (
              <button
                key={key}
                onClick={() => generated
                  ? navigate(`/project/${slug}/artifact/${key}`)
                  : setGeneratingArtifact(key)
                }
                className="w-full flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3 shadow-sm hover:border-border-strong hover:shadow-md transition-all group text-left"
              >
                <div>
                  <p className="font-medium text-fg-1 text-sm group-hover:text-coral transition-colors">{label}</p>
                  <p className="text-xs text-fg-3">{description}</p>
                </div>
                {generated ? (
                  <span className="text-xs font-medium text-success bg-success-soft px-2 py-1 rounded-full shrink-0">
                    Generated
                  </span>
                ) : (
                  <span className="text-xs font-medium text-coral bg-coral-soft px-2 py-1 rounded-full shrink-0">
                    Generate
                  </span>
                )}
              </button>
            )
          }

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3 shadow-sm opacity-60"
            >
              <div>
                <p className="font-medium text-fg-1 text-sm">{label}</p>
                <p className="text-xs text-fg-3">{description}</p>
              </div>
              <span className="text-xs font-medium text-fg-3 bg-surface-3 px-2 py-1 rounded-full shrink-0">
                Coming soon
              </span>
            </div>
          )
        })}
      </div>

      {generatingArtifact && (
        getCliMode() ? (
          <CLIInstructionsModal
            slug={slug}
            project={project}
            artifactKey={generatingArtifact}
            onClose={() => setGeneratingArtifact(null)}
            onRefresh={(found) => {
              setGeneratingArtifact(null)
              if (found) {
                setArtifactStatus((prev) => ({ ...prev, [generatingArtifact]: true }))
                navigate(`/project/${slug}/artifact/${generatingArtifact}`)
              }
            }}
          />
        ) : (
          <GenerateArtifactModal
            slug={slug}
            project={project}
            artifactKey={generatingArtifact}
            artifactStatus={artifactStatus}
            onClose={() => {
              setGeneratingArtifact(null)
              Promise.all(
                ARTIFACT_TYPES.map(async ({ type }) => {
                  const key = artifactFilename(slug, type)
                  const content = await readArtifact(slug, key)
                  return [key, content !== null]
                })
              ).then((entries) => setArtifactStatus(Object.fromEntries(entries)))
            }}
          />
        )
      )}
    </div>
  )
}
