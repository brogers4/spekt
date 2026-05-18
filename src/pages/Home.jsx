import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
import logoWordmark from '../assets/logo-wordmark.svg'

export default function Home() {
  const navigate = useNavigate()
  const { projects, loading } = useWorkspace()
  const [projectsRoot, setProjectsRoot] = useState(null)
  const { setTitle, setCrumbs } = useLayout()

  useEffect(() => {
    setTitle('All projects')
    setCrumbs([])
  }, [])

  useEffect(() => {
    fetch('/api/info').then(r => r.json()).then(d => setProjectsRoot(d.projectsRoot))
  }, [])

  if (loading) {
    return <div className="max-w-[720px] mx-auto py-16 px-8 text-fg-3 text-sm">Loading…</div>
  }

  return (
    <div className="max-w-[720px] mx-auto py-10 px-8">
      <img src={logoWordmark} alt="PO Agent" className="h-16 w-auto" />
      <p className="mt-3 text-lg text-fg-3">
        Answer a few questions about your product and get a full suite of artifacts
        generated and stored locally on your machine.
      </p>

      {/* Storage location */}
      <div className="mt-8 rounded-lg border border-border bg-surface-2 p-4 shadow-sm flex items-center gap-3">
        <span className="inline-block w-2 h-2 rounded-full bg-success shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg-2">Projects stored at</p>
          <p className="text-xs text-fg-3 font-mono truncate mt-0.5">
            {projectsRoot ?? 'po-agent/projects/'}
          </p>
        </div>
      </div>

      {/* Project list */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-fg-3 uppercase tracking-wide">Projects</h2>
          <button
            onClick={() => navigate('/new-project')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-fg-on-accent hover:bg-coral-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-fg-3 text-sm">No projects yet.</p>
            <button
              onClick={() => navigate('/new-project')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-coral px-5 py-2.5 text-sm font-medium text-fg-on-accent hover:bg-coral-hover transition-colors"
            >
              Start your first project
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.slug}
                onClick={() => navigate(`/project/${project.slug}`)}
                className="w-full text-left rounded-lg border border-border bg-surface-2 px-4 py-3.5 shadow-sm hover:border-border-strong hover:shadow-md transition-all"
              >
                <p className="font-medium text-fg-1">{project.name}</p>
                {project.description && (
                  <p className="text-sm text-fg-3 mt-0.5 truncate">{project.description}</p>
                )}
                {project.created && (
                  <p className="text-xs text-fg-4 mt-1">{project.created}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
