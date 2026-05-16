import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import nodeFs from 'node:fs'
import nodeFsP from 'node:fs/promises'
import nodePath from 'node:path'
import Busboy from 'busboy'

const PROJECTS_ROOT = nodePath.join(process.cwd(), 'projects')

const MIME_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf', '.txt': 'text/plain', '.md': 'text/markdown',
  '.json': 'application/json', '.csv': 'text/csv', '.html': 'text/html',
}

function safePath(...parts) {
  const resolved = nodePath.resolve(PROJECTS_ROOT, ...parts)
  if (!resolved.startsWith(PROJECTS_ROOT + nodePath.sep) && resolved !== PROJECTS_ROOT) {
    throw Object.assign(new Error('Invalid path'), { status: 400 })
  }
  return resolved
}

async function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => { try { resolve(JSON.parse(body)) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseReadme(text, slug) {
  const nameMatch = text.match(/^# (.+)$/m)
  const createdMatch = text.match(/\*\*Created:\*\* (\d{4}-\d{2}-\d{2})/)
  const descMatch = text.match(/## Description\n\n([\s\S]*?)(\n##|$)/)
  return {
    slug,
    name: nameMatch?.[1] ?? slug,
    created: createdMatch?.[1] ?? '',
    description: descMatch?.[1]?.trim() ?? '',
  }
}

function jsonResponse(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

async function handleApi(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const pathname = url.pathname
  const method = req.method

  // GET /api/info
  if (method === 'GET' && pathname === '/api/info') {
    return jsonResponse(res, 200, { projectsRoot: PROJECTS_ROOT })
  }

  // GET /api/projects
  if (method === 'GET' && pathname === '/api/projects') {
    const entries = []
    try {
      for (const entry of await nodeFsP.readdir(PROJECTS_ROOT, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const readmePath = nodePath.join(PROJECTS_ROOT, entry.name, 'README.md')
        try {
          const text = await nodeFsP.readFile(readmePath, 'utf8')
          entries.push(parseReadme(text, entry.name))
        } catch { /* skip dirs without README */ }
      }
    } catch { /* projects/ may not exist yet */ }
    entries.sort((a, b) => (b.created > a.created ? 1 : -1))
    return jsonResponse(res, 200, entries)
  }

  // POST /api/projects
  if (method === 'POST' && pathname === '/api/projects') {
    const { name, description } = await readJson(req)
    const slug = slugify(name)
    const projectDir = safePath(slug)
    try {
      await nodeFsP.access(projectDir)
      return jsonResponse(res, 409, { error: `A project named "${slug}" already exists` })
    } catch { /* doesn't exist, proceed */ }
    await nodeFsP.mkdir(projectDir, { recursive: true })
    await nodeFsP.mkdir(nodePath.join(projectDir, 'context'), { recursive: true })
    const created = new Date().toISOString().slice(0, 10)
    const readme = `# ${name}\n\n**Created:** ${created}\n\n## Description\n\n${description ?? ''}\n`
    await nodeFsP.writeFile(nodePath.join(projectDir, 'README.md'), readme, 'utf8')
    return jsonResponse(res, 201, { slug, name, created, description: description ?? '' })
  }

  // Routes with :slug
  const slugFileMatch = pathname.match(/^\/api\/projects\/([^/]+)\/files\/([^/]+)(\/meta)?$/)
  const slugContextListMatch = pathname.match(/^\/api\/projects\/([^/]+)\/context$/)
  const slugContextFileMatch = pathname.match(/^\/api\/projects\/([^/]+)\/context\/([^/]+)(\/text)?$/)

  if (slugFileMatch) {
    const slug = decodeURIComponent(slugFileMatch[1])
    const filename = decodeURIComponent(slugFileMatch[2])
    const isMeta = !!slugFileMatch[3]
    const filePath = safePath(slug, filename)

    if (method === 'GET' && isMeta) {
      try {
        const stat = await nodeFsP.stat(filePath)
        return jsonResponse(res, 200, { lastModified: stat.mtimeMs })
      } catch { return jsonResponse(res, 404, { error: 'Not found' }) }
    }

    if (method === 'GET') {
      try {
        const content = await nodeFsP.readFile(filePath, 'utf8')
        return jsonResponse(res, 200, { content })
      } catch { return jsonResponse(res, 404, { error: 'Not found' }) }
    }

    if (method === 'PUT') {
      const { content } = await readJson(req)
      await nodeFsP.mkdir(nodePath.dirname(filePath), { recursive: true })
      await nodeFsP.writeFile(filePath, content, 'utf8')
      return jsonResponse(res, 200, {})
    }
  }

  if (slugContextListMatch) {
    const slug = decodeURIComponent(slugContextListMatch[1])
    const contextDir = safePath(slug, 'context')

    if (method === 'GET') {
      try {
        const entries = []
        for (const entry of await nodeFsP.readdir(contextDir, { withFileTypes: true })) {
          if (!entry.isFile()) continue
          const stat = await nodeFsP.stat(nodePath.join(contextDir, entry.name))
          entries.push({ filename: entry.name, lastModified: stat.mtimeMs, size: stat.size })
        }
        entries.sort((a, b) => b.lastModified - a.lastModified)
        return jsonResponse(res, 200, entries)
      } catch { return jsonResponse(res, 200, []) }
    }

    if (method === 'POST') {
      await nodeFsP.mkdir(contextDir, { recursive: true })
      return new Promise((resolve, reject) => {
        const bb = Busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } })
        let saved = null
        bb.on('file', (name, stream, info) => {
          const filename = info.filename
          let dest
          try { dest = safePath(slug, 'context', filename) } catch (e) { stream.resume(); return }
          const writer = nodeFs.createWriteStream(dest)
          stream.pipe(writer)
          writer.on('finish', async () => {
            const stat = await nodeFsP.stat(dest)
            saved = { filename, lastModified: stat.mtimeMs, size: stat.size }
          })
          writer.on('error', reject)
        })
        bb.on('finish', () => {
          if (saved) { jsonResponse(res, 201, saved); resolve() }
          else { jsonResponse(res, 400, { error: 'No file received' }); resolve() }
        })
        bb.on('error', reject)
        req.pipe(bb)
      })
    }
  }

  if (slugContextFileMatch) {
    const slug = decodeURIComponent(slugContextFileMatch[1])
    const filename = decodeURIComponent(slugContextFileMatch[2])
    const isText = !!slugContextFileMatch[3]
    const filePath = safePath(slug, 'context', filename)

    if (method === 'GET' && isText) {
      try {
        const content = await nodeFsP.readFile(filePath, 'utf8')
        return jsonResponse(res, 200, { content })
      } catch { return jsonResponse(res, 404, { error: 'Not found' }) }
    }

    if (method === 'GET') {
      try {
        const ext = nodePath.extname(filename).toLowerCase()
        const mimeType = MIME_TYPES[ext] ?? 'application/octet-stream'
        const stat = await nodeFsP.stat(filePath)
        res.statusCode = 200
        res.setHeader('Content-Type', mimeType)
        res.setHeader('Content-Length', stat.size)
        nodeFs.createReadStream(filePath).pipe(res)
      } catch { jsonResponse(res, 404, { error: 'Not found' }) }
      return
    }

    if (method === 'PUT') {
      const { content } = await readJson(req)
      await nodeFsP.mkdir(nodePath.dirname(filePath), { recursive: true })
      await nodeFsP.writeFile(filePath, content, 'utf8')
      return jsonResponse(res, 200, {})
    }

    if (method === 'DELETE') {
      try { await nodeFsP.unlink(filePath) } catch { /* already gone */ }
      res.statusCode = 204
      res.end()
      return
    }
  }

  jsonResponse(res, 404, { error: 'Not found' })
}

function localFsApiPlugin() {
  return {
    name: 'local-fs-api',
    async configureServer(server) {
      await nodeFsP.mkdir(PROJECTS_ROOT, { recursive: true })
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        try {
          await handleApi(req, res)
        } catch (err) {
          jsonResponse(res, err.status ?? 500, { error: err.message })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localFsApiPlugin()],
})
