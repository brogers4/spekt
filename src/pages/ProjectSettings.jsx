import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
import { updateProject } from '../lib/fs'

export default function ProjectSettings() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { projects, refreshProjects } = useWorkspace()
  const { setTitle, setCrumbs } = useLayout()

  const project = projects.find((p) => p.slug === slug)

  useEffect(() => {
    if (!project) return
    setTitle('Project settings')
    setCrumbs([
      { label: 'All projects', href: '/projects' },
      { label: project.name, href: `/project/${slug}` },
    ])
  }, [project?.name, slug])

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
      <div className="max-w-2xl mx-auto py-16 px-6 text-fg-3">
        Project not found.{' '}
        <button onClick={() => navigate('/')} className="text-coral underline">
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
    <div className="max-w-[720px] mx-auto py-10 px-8">
      <h1 className="text-2xl font-bold text-fg-1 mb-8 font-display">Project settings</h1>

      {/* Project details */}
      <section>
        <h2 className="text-sm font-semibold text-fg-3 uppercase tracking-wide mb-4">
          Project details
</h2>
        <form onSubmit={handleSave} className="bg-surface-2 border border-border rounded-lg shadow-sm divide-y divide-border">

          {/* Name */}
          <div className="px-5 py-4">
            <label htmlFor="name" className="block text-sm font-medium text-fg-2 mb-1">
              Project name
</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm shadow-sm outline-none"
            />
          </div>

          {/* Description */}
          <div className="px-5 py-4">
            <label htmlFor="description" className="block text-sm font-medium text-fg-2 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm shadow-sm outline-none resize-none"
            />
            <p className="mt-1.5 text-xs text-fg-3">
              Updates the Description section in README.md.
            </p>
          </div>

          {/* Created date (read-only) */}
          {project.created && (
            <div className="px-5 py-4">
              <p className="text-sm font-medium text-fg-2 mb-1">Created</p>
              <p className="text-sm text-fg-3">{project.created}</p>
            </div>
          )}

          {/* Folder (read-only) */}
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-fg-2 mb-1">Folder</p>
            <p className="font-mono text-xs text-fg-3 bg-surface-1 border border-border rounded px-3 py-2">
              projects/{slug}
            </p>
            <p className="mt-1.5 text-xs text-fg-3">
              Folder name is set at creation and cannot be renamed.
            </p>
          </div>

          {/* Save */}
          <div className="px-5 py-4 bg-surface-1 flex items-center justify-between rounded-b-lg">
            {saved ? (
              <span className="text-xs text-success flex items-center gap-1.5">
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
              className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-fg-on-accent hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>


    </div>
  )
}
