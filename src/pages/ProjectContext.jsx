import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { listContextFiles, deleteContextFile } from '../lib/fs'

function formatDate(ms) {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function ProjectContext() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { handle, projects } = useWorkspace()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const project = projects.find((p) => p.slug === slug)

  useEffect(() => {
    if (!handle || !slug) return
    listContextFiles(handle, slug).then((f) => {
      setFiles(f)
      setLoading(false)
    })
  }, [handle, slug])

  async function handleDelete(filename) {
    await deleteContextFile(handle, slug, filename)
    setFiles((prev) => prev.filter((f) => f.filename !== filename))
    setConfirmDelete(null)
  }

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
        <span className="text-gray-600">Context</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Context</h1>
          <p className="text-sm text-gray-400 mt-0.5">Notes and reference material for this project</p>
        </div>
        <button
          onClick={() => navigate(`/project/${slug}/context/new`)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Note
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : files.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-14 text-center">
          <svg className="w-8 h-8 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm text-gray-400">No context files yet.</p>
          <p className="text-xs text-gray-400 mt-1">Add meeting notes, feature ideas, or any reference material.</p>
          <button
            onClick={() => navigate(`/project/${slug}/context/new`)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Create your first note
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map(({ filename, lastModified }) => {
            const title = filename.replace(/\.md$/, '').replace(/-/g, ' ')
            const isConfirming = confirmDelete === filename
            return (
              <div
                key={filename}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <button
                  onClick={() => navigate(`/project/${slug}/context/${filename}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 capitalize truncate">{title}</p>
                    <p className="text-xs text-gray-400">{formatDate(lastModified)}</p>
                  </div>
                </button>

                {isConfirming ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">Delete?</span>
                    <button
                      onClick={() => handleDelete(filename)}
                      className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(filename)}
                    className="shrink-0 p-1.5 text-gray-300 hover:text-red-400 rounded hover:bg-gray-50 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
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
