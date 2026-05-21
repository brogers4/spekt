import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
import { listContextFiles, uploadContextFile, deleteContextFile } from '../lib/fs'

function formatDate(ms) {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'md') return 'note'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['txt', 'csv', 'json', 'xml', 'html', 'js', 'ts', 'py', 'rb', 'sh'].includes(ext)) return 'text'
  return 'file'
}

function FileIcon({ filename }) {
  const cat = fileCategory(filename)
  const cls = "w-4 h-4 shrink-0"
  if (cat === 'note') return (
    <svg className={`${cls} text-coral`} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
  if (cat === 'image') return (
    <svg className={`${cls} text-success`} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
  if (cat === 'pdf') return (
    <svg className={`${cls} text-danger`} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
  return (
    <svg className={`${cls} text-fg-3`} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

export default function ProjectContext() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { projects } = useWorkspace()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  const project = projects.find((p) => p.slug === slug)
  const { setTitle, setCrumbs, setBack } = useLayout()

  useEffect(() => {
    if (!project) return
    setTitle('Context')
    setCrumbs([
      { label: 'All projects', href: '/projects' },
      { label: project.name, href: `/project/${slug}` },
    ])
    setBack(`/project/${slug}`)
  }, [project?.name, slug])

  useEffect(() => {
    if (!slug) return
    listContextFiles(slug).then((f) => { setFiles(f); setLoading(false) })
  }, [slug])

  async function handleUpload(fileList) {
    if (!fileList?.length) return
    setUploading(true)
    const uploaded = []
    for (const file of fileList) {
      const result = await uploadContextFile(slug, file)
      uploaded.push(result)
    }
    setFiles((prev) => {
      const names = new Set(uploaded.map((f) => f.filename))
      return [...prev.filter((f) => !names.has(f.filename)), ...uploaded]
        .sort((a, b) => b.lastModified - a.lastModified)
    })
    setUploading(false)
  }

  async function handleDelete(filename) {
    await deleteContextFile(slug, filename)
    setFiles((prev) => prev.filter((f) => f.filename !== filename))
    setConfirmDelete(null)
  }

  function onDragEnter(e) {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.items?.length) setIsDragging(true)
  }
  function onDragLeave(e) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }
  function onDragOver(e) { e.preventDefault() }
  function onDrop(e) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    handleUpload(e.dataTransfer.files)
  }

  if (!project) {
    return (
      <div className="max-w-[720px] mx-auto py-16 px-8 text-fg-3">
        Project not found.{' '}
        <button onClick={() => navigate('/')} className="text-coral underline">Go home</button>
      </div>
    )
  }

  return (
    <div
      className="max-w-[720px] mx-auto py-10 px-8 relative"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coral-soft/90 border-4 border-dashed border-coral pointer-events-none">
          <div className="text-center">
            <svg className="w-12 h-12 text-coral mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-lg font-semibold text-coral">Drop files to upload</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-fg-1 font-display">Context</h1>
          <p className="text-sm text-fg-3 mt-0.5">Notes and reference material for this project</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-fg-2 hover:bg-surface-1 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <button
            onClick={() => navigate(`/project/${slug}/context/new`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-coral px-3 py-2 text-sm font-medium text-fg-on-accent hover:bg-coral-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New note
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-fg-3">Loading…</p>
      ) : files.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border py-16 text-center">
          <svg className="w-8 h-8 text-fg-4 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm font-medium text-fg-3">Drop files here or use the buttons above</p>
          <p className="text-xs text-fg-3 mt-1">Upload any file type — PDFs, images, notes, transcripts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map(({ filename, lastModified, size }) => {
            const isConfirming = confirmDelete === filename
            const displayName = filename
            return (
              <div
                key={filename}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 shadow-sm hover:border-border-strong hover:shadow-md transition-all"
              >
                <button
                  onClick={() => navigate(`/project/${slug}/context/${encodeURIComponent(filename)}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <FileIcon filename={filename} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg-1 truncate">{displayName}</p>
                    <p className="text-xs text-fg-3">
                      {formatDate(lastModified)}
                      {size != null && <span className="ml-2">{formatSize(size)}</span>}
                    </p>
                  </div>
                </button>

                {isConfirming ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-fg-3">Delete this file?</span>
                    <button onClick={() => handleDelete(filename)} className="text-xs font-medium text-danger hover:text-danger px-2 py-1 rounded hover:bg-danger-soft transition-colors">Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs text-fg-3 hover:text-fg-2 px-2 py-1 rounded hover:bg-surface-3 transition-colors">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(filename)}
                    className="shrink-0 p-1.5 text-fg-4 hover:text-danger rounded hover:bg-surface-1 transition-colors"
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

