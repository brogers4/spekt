import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
import { createProject } from '../lib/fs'

export default function NewProject() {
  const navigate = useNavigate()
  const { refreshProjects } = useWorkspace()
  const { setTitle, setCrumbs } = useLayout()
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setTitle('New project')
    setCrumbs([{ label: 'All projects', href: '/projects' }])
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const project = await createProject(form)
      await refreshProjects()
      navigate(`/project/${project.slug}`)
    } catch (err) {
      setError(err.message || 'Failed to create project.')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[720px] mx-auto py-10 px-8">
      <h2 className="text-3xl font-bold text-fg-1 font-display">New project</h2>
      <p className="mt-2 text-fg-3">Start with the basics — you can add more later.</p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-fg-2">
            Project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Checkout Redesign"
            className="mt-1 w-full rounded-lg border border-border px-4 py-2.5 text-sm shadow-sm outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-fg-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="What problem does this project solve? Who is it for?"
            className="mt-1 w-full rounded-lg border border-border px-4 py-2.5 text-sm shadow-sm outline-none resize-none"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={!form.name.trim() || saving}
            className="rounded-lg bg-coral px-6 py-2.5 text-sm font-medium text-fg-on-accent hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Creating…' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  )
}
