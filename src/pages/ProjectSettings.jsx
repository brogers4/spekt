import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { updateProject } from '../lib/fs'

export default function ProjectSettings() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { projects, refreshProjects } = useWorkspace()

  const project = projects.find((p) => p.slug === slug)

  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name ?? '',
        description: project.description ?? '',
      })
    }
  }, [project])

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-gray-500">
        Project not found.{' '}
        <button onClick={() => navigate('/')} className="text-indigo-600 underline">
          Go home
        </button>
      </div>
    )
  }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await updateProject(slug, form)
    await refreshProjects()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const isDirty =
    form.name !== (project.name ?? '') ||
    form.description !== (project.description ?? '')

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 flex-wrap">
        <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">
          All Projects
        </button>
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <button onClick={() => navigate(`/project/${slug}`)} className="hover:text-gray-600 transition-colors truncate">
          {project.name}
        </button>
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-gray-600">Settings</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Project Settings</h1>

      {/* Project details */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Project Details
        </h2>
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">

          {/* Name */}
          <div className="px-5 py-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Description */}
          <div className="px-5 py-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Updates the Description section in README.md.
            </p>
          </div>

          {/* Created date (read-only) */}
          {project.created && (
            <div className="px-5 py-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Created</p>
              <p className="text-sm text-gray-500">{project.created}</p>
            </div>
          )}

          {/* Folder (read-only) */}
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Folder</p>
            <p className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2">
              projects/{slug}
            </p>
            <p className="mt-1.5 text-xs text-gray-400">
              Folder name is set at creation and cannot be renamed.
            </p>
          </div>

          {/* Save */}
          <div className="px-5 py-4 bg-gray-50 flex items-center justify-between rounded-b-lg">
            {saved ? (
              <span className="text-xs text-green-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Saved
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={!isDirty || saving || !form.name.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>


    </div>
  )
}
