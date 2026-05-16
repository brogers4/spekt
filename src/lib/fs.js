import { saveWorkspaceHandle, loadWorkspaceHandle } from './storage'

export function isSupported() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function pickWorkspace() {
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
  await saveWorkspaceHandle(handle)
  return handle
}

export async function getWorkspaceHandle() {
  const handle = await loadWorkspaceHandle()
  if (!handle) return null

  const permission = await handle.queryPermission({ mode: 'readwrite' })
  if (permission === 'granted') return handle

  const request = await handle.requestPermission({ mode: 'readwrite' })
  return request === 'granted' ? handle : null
}

export async function createProject(workspaceHandle, { name, description }) {
  const slug = slugify(name)
  const projectDir = await workspaceHandle.getDirectoryHandle(slug, { create: true })

  const date = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local timezone
  const content = [
    `# ${name}`,
    '',
    `**Created:** ${date}`,
    '',
    '## Description',
    '',
    description || '_No description provided._',
    '',
  ].join('\n')

  const fileHandle = await projectDir.getFileHandle('README.md', { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()

  return { slug, name, description, created: date }
}

export async function listProjects(workspaceHandle) {
  const projects = []
  for await (const [name, handle] of workspaceHandle.entries()) {
    if (handle.kind !== 'directory') continue
    try {
      const readmeHandle = await handle.getFileHandle('README.md')
      const file = await readmeHandle.getFile()
      const text = await file.text()
      const project = parseReadme(text, name)
      projects.push(project)
    } catch {
      // directory exists but has no README.md — skip it
    }
  }
  return projects.sort((a, b) => (b.created || '').localeCompare(a.created || ''))
}

export async function writeArtifact(workspaceHandle, projectSlug, filename, content) {
  const projectDir = await workspaceHandle.getDirectoryHandle(projectSlug)
  const fileHandle = await projectDir.getFileHandle(filename, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

export async function updateProject(workspaceHandle, slug, { name, description }) {
  const existing = await readArtifact(workspaceHandle, slug, 'README.md')
  const createdMatch = existing?.match(/\*\*Created:\*\*\s+(.+)/)
  const created = createdMatch ? createdMatch[1].trim() : new Date().toLocaleDateString('en-CA')

  const content = [
    `# ${name}`,
    '',
    `**Created:** ${created}`,
    '',
    '## Description',
    '',
    description || '_No description provided._',
    '',
  ].join('\n')

  await writeArtifact(workspaceHandle, slug, 'README.md', content)
  return { slug, name, description, created }
}

export async function readArtifact(workspaceHandle, projectSlug, filename) {
  try {
    const projectDir = await workspaceHandle.getDirectoryHandle(projectSlug)
    const fileHandle = await projectDir.getFileHandle(filename)
    const file = await fileHandle.getFile()
    return file.text()
  } catch {
    return null
  }
}

export async function getFileLastModified(workspaceHandle, projectSlug, filename) {
  try {
    const projectDir = await workspaceHandle.getDirectoryHandle(projectSlug)
    const fileHandle = await projectDir.getFileHandle(filename)
    const file = await fileHandle.getFile()
    return file.lastModified
  } catch {
    return null
  }
}

async function getContextDir(workspaceHandle, projectSlug, { create = false } = {}) {
  const projectDir = await workspaceHandle.getDirectoryHandle(projectSlug)
  return projectDir.getDirectoryHandle('context', { create })
}

export async function listContextFiles(workspaceHandle, projectSlug) {
  try {
    const contextDir = await getContextDir(workspaceHandle, projectSlug)
    const files = []
    for await (const [name, handle] of contextDir.entries()) {
      if (handle.kind !== 'file' || !name.endsWith('.md')) continue
      const file = await handle.getFile()
      files.push({ filename: name, lastModified: file.lastModified })
    }
    return files.sort((a, b) => b.lastModified - a.lastModified)
  } catch {
    return []
  }
}

export async function readContextFile(workspaceHandle, projectSlug, filename) {
  try {
    const contextDir = await getContextDir(workspaceHandle, projectSlug)
    const fileHandle = await contextDir.getFileHandle(filename)
    const file = await fileHandle.getFile()
    return file.text()
  } catch {
    return null
  }
}

export async function writeContextFile(workspaceHandle, projectSlug, filename, content) {
  const contextDir = await getContextDir(workspaceHandle, projectSlug, { create: true })
  const fileHandle = await contextDir.getFileHandle(filename, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

export async function deleteContextFile(workspaceHandle, projectSlug, filename) {
  const contextDir = await getContextDir(workspaceHandle, projectSlug)
  await contextDir.removeEntry(filename)
}

function parseReadme(text, slug) {
  const nameMatch = text.match(/^#\s+(.+)$/m)
  const createdMatch = text.match(/\*\*Created:\*\*\s+(.+)/)
  const descMatch = text.match(/## Description\s+\n+([\s\S]+?)(\n##|$)/)

  return {
    slug,
    name: nameMatch ? nameMatch[1].trim() : slug,
    created: createdMatch ? createdMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
  }
}
