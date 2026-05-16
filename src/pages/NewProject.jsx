import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { createProject } from '../lib/fs'

export default function NewProject() {
  const navigate = useNavigate()
  const { handle, chooseWorkspace, refreshProjects } = useWorkspace()
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!handle) return
    setSaving(true)
    setError(null)
    try {
      const project = await createProject(handle, form)
      await refreshProjects()
      navigate(`/project/${project.slug}`)
    } catch (err) {
      setError(err.message || 'Failed to create project.')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-6">
      <button
        onClick={() => navigate('/')}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>

      <h2 className="text-3xl font-bold text-gray-900">New Project</h2>
      <p className="mt-2 text-gray-500">Start with the basics. More details come later.</p>

      {!handle && (
        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          No workspace selected.{' '}
          <button onClick={chooseWorkspace} className="underline font-medium">
            Choose a folder
          </button>{' '}
          before creating a project.
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Checkout Redesign"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="What problem does this project solve? Who is it for?"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={!form.name.trim() || !handle || saving}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
