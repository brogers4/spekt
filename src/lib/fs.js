export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function api(path, options) {
  return fetch(path, options)
}

export async function listProjects() {
  const res = await api('/api/projects')
  if (!res.ok) throw new Error('Failed to list projects')
  return res.json()
}

export async function createProject({ name, description }) {
  const res = await api('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to create project')
  return data
}

export async function readArtifact(slug, filename) {
  const res = await api(`/api/projects/${slug}/files/${encodeURIComponent(filename)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to read file')
  const { content } = await res.json()
  return content
}

export async function writeArtifact(slug, filename, content) {
  const res = await api(`/api/projects/${slug}/files/${encodeURIComponent(filename)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error('Failed to write file')
}

export async function updateProject(slug, { name, description }) {
  const existing = await readArtifact(slug, 'README.md') ?? ''
  const createdMatch = existing.match(/\*\*Created:\*\* (\d{4}-\d{2}-\d{2})/)
  const created = createdMatch?.[1] ?? new Date().toISOString().slice(0, 10)
  const readme = `# ${name}\n\n**Created:** ${created}\n\n## Description\n\n${description ?? ''}\n`
  await writeArtifact(slug, 'README.md', readme)
  return { slug, name, created, description: description ?? '' }
}

export async function getFileLastModified(slug, filename) {
  const res = await api(`/api/projects/${slug}/files/${encodeURIComponent(filename)}/meta`)
  if (res.status === 404) return null
  if (!res.ok) return null
  const { lastModified } = await res.json()
  return lastModified
}

export async function listContextFiles(slug) {
  const res = await api(`/api/projects/${slug}/context`)
  if (!res.ok) return []
  return res.json()
}

export async function uploadContextFile(slug, file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await api(`/api/projects/${slug}/context`, { method: 'POST', body: fd })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to upload file')
  return data
}

export async function readContextFile(slug, filename) {
  const res = await api(`/api/projects/${slug}/context/${encodeURIComponent(filename)}/text`)
  if (res.status === 404) return null
  if (!res.ok) return null
  const { content } = await res.json()
  return content
}

export async function readContextFileAsObjectUrl(slug, filename) {
  const res = await api(`/api/projects/${slug}/context/${encodeURIComponent(filename)}`)
  if (!res.ok) return null
  const mimeType = res.headers.get('Content-Type') ?? 'application/octet-stream'
  const blob = await res.blob()
  return { url: URL.createObjectURL(blob), mimeType }
}

export async function writeContextFile(slug, filename, content) {
  const res = await api(`/api/projects/${slug}/context/${encodeURIComponent(filename)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error('Failed to write context file')
}

export async function deleteContextFile(slug, filename) {
  await api(`/api/projects/${slug}/context/${encodeURIComponent(filename)}`, { method: 'DELETE' })
}
