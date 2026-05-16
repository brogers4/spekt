import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'

export default function Home() {
  const navigate = useNavigate()
  const { projects, loading } = useWorkspace()
  const [projectsRoot, setProjectsRoot] = useState(null)

  useEffect(() => {
    fetch('/api/info').then(r => r.json()).then(d => setProjectsRoot(d.projectsRoot))
  }, [])

  if (loading) {
    return <div className="max-w-2xl mx-auto py-16 px-6 text-gray-400 text-sm">Loading…</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">PO Agent</h1>
      <p className="mt-3 text-lg text-gray-500">
        Answer a few questions about your product and get a full suite of artifacts
        generated and stored locally on your machine.
      </p>

      {/* Storage location */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700">Projects stored at</p>
          <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
            {projectsRoot ?? 'po-agent/projects/'}
          </p>
        </div>
      </div>

      {/* Project list */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Projects</h2>
          <button
            onClick={() => navigate('/new-project')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-400 text-sm">No projects yet.</p>
            <button
              onClick={() => navigate('/new-project')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
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
                className="w-full text-left rounded-lg border border-gray-200 bg-white px-4 py-3.5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <p className="font-medium text-gray-800">{project.name}</p>
                {project.description && (
                  <p className="text-sm text-gray-400 mt-0.5 truncate">{project.description}</p>
                )}
                {project.created && (
                  <p className="text-xs text-gray-300 mt-1">{project.created}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
