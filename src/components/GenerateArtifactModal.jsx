import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hasApiKey, identifyPrfaqUnknowns, generatePrfaq } from '../lib/claude'
import { readArtifact, writeArtifact, listContextFiles, readContextFile } from '../lib/fs'
import prfaqTemplate from '../templates/prfaq.md?raw'

const PHASES = { preflight: 0, gathering: 1, questioning: 2, generating: 3 }

export default function GenerateArtifactModal({ slug, project, artifactKey, onClose }) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState(PHASES.preflight)
  const [contextCount, setContextCount] = useState(null)
  const [unknowns, setUnknowns] = useState([])
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const apiKeyReady = hasApiKey()
  const label = artifactKey === 'prfaq.md' ? 'PRFAQ' : artifactKey

  useEffect(() => {
    listContextFiles(slug).then((f) => setContextCount(f.length))
    return () => abortRef.current?.abort()
  }, [slug])

  async function loadContext() {
    const readme = await readArtifact(slug, 'README.md')
    const files = await listContextFiles(slug)
    const contextFiles = await Promise.all(
      files.map(async (f) => {
        if (!f.filename.match(/\.(md|txt|csv|json|xml|html|js|ts|py|rb|sh)$/i)) return null
        const content = await readContextFile(slug, f.filename)
        return content ? { filename: f.filename, content } : null
      })
    )
    return { readme, contextFiles: contextFiles.filter(Boolean) }
  }

  async function start() {
    setError(null)
    setPhase(PHASES.gathering)
    abortRef.current = new AbortController()
    try {
      const { readme, contextFiles } = await loadContext()
      const template = prfaqTemplate
      const found = await identifyPrfaqUnknowns({ readme, contextFiles, signal: abortRef.current.signal })
      if (found.length === 0) {
        await runGeneration({ readme, contextFiles, answers: {}, template })
      } else {
        setUnknowns(found)
        setAnswers(Object.fromEntries(found.map((u) => [u.field, null])))
        setPhase(PHASES.questioning)
      }
    } catch (err) {
      setPhase(PHASES.preflight)
      if (err.name !== 'AbortError') setError(err.message || "Something didn't go through — try again.")
    }
  }

  async function continueGeneration() {
    setError(null)
    setPhase(PHASES.generating)
    abortRef.current = new AbortController()
    try {
      const { readme, contextFiles } = await loadContext()
      const template = prfaqTemplate
      const resolvedAnswers = Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, v ?? '[placeholder]'])
      )
      await runGeneration({ readme, contextFiles, answers: resolvedAnswers, template })
    } catch (err) {
      setPhase(PHASES.questioning)
      if (err.name !== 'AbortError') setError(err.message || "Something didn't go through — try again.")
    }
  }

  async function runGeneration({ readme, contextFiles, answers, template }) {
    setPhase(PHASES.generating)
    const result = await generatePrfaq({ readme, contextFiles, answers, template, signal: abortRef.current.signal })
    await writeArtifact(slug, artifactKey, result)
    onClose()
    navigate(`/project/${slug}/artifact/${artifactKey}`)
  }

  function cancel() {
    abortRef.current?.abort()
    onClose()
  }

  const allAnswered = unknowns.length > 0 && unknowns.every((u) => answers[u.field] !== null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-2 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-fg-1">Generate {label}</h2>
          {phase === PHASES.preflight && (
            <button onClick={cancel} className="text-fg-3 hover:text-fg-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {/* Preflight */}
          {phase === PHASES.preflight && (
            <div className="space-y-4">
              <div className="space-y-2">
                <StatusRow
                  ok={apiKeyReady}
                  label="Claude API key"
                  okText="Configured"
                  failText={
                    <span>
                      Not set —{' '}
                      <button onClick={() => { onClose(); navigate('/settings') }} className="text-coral underline">
                        add in Settings
                      </button>
                    </span>
                  }
                />
                <StatusRow
                  ok={contextCount !== null}
                  label="Context files"
                  okText={contextCount === 0 ? 'None — the agent will use your project description' : `${contextCount} file${contextCount === 1 ? '' : 's'} available`}
                  failText="Loading…"
                />
              </div>
              {error && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>}
            </div>
          )}

          {/* Gathering */}
          {phase === PHASES.gathering && (
            <div className="flex flex-col items-center py-4 gap-3">
              <Spinner />
              <p className="text-sm text-fg-2">Reviewing your context…</p>
            </div>
          )}

          {/* Questioning */}
          {phase === PHASES.questioning && (
            <div className="space-y-4">
              <p className="text-sm text-fg-2">
                The agent needs a few more details to finish the {label}. Choose how to handle each one:
              </p>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {unknowns.map((u) => (
                  <UnknownCard
                    key={u.field}
                    unknown={u}
                    value={answers[u.field]}
                    onChange={(v) => setAnswers((prev) => ({ ...prev, [u.field]: v }))}
                  />
                ))}
              </div>
              {error && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>}
            </div>
          )}

          {/* Generating */}
          {phase === PHASES.generating && (
            <div className="flex flex-col items-center py-4 gap-3">
              <Spinner />
              <p className="text-sm text-fg-2">Generating your {label}…</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-1 border-t border-border flex items-center justify-between">
          <button
            onClick={cancel}
            className="text-sm text-fg-3 hover:text-fg-2 transition-colors"
          >
            Cancel
          </button>

          {phase === PHASES.preflight && (
            <button
              onClick={start}
              disabled={!apiKeyReady}
              className="rounded-lg bg-coral px-5 py-2 text-sm font-medium text-fg-on-accent hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Start
            </button>
          )}

          {phase === PHASES.questioning && (
            <button
              onClick={continueGeneration}
              disabled={!allAnswered}
              className="rounded-lg bg-coral px-5 py-2 text-sm font-medium text-fg-on-accent hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusRow({ ok, label, okText, failText }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      {ok !== null && (
        <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${ok ? 'bg-success-soft' : 'bg-danger-soft'}`}>
          {ok ? (
            <svg className="w-2.5 h-2.5 text-success" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-2.5 h-2.5 text-danger" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          )}
        </span>
      )}
      <div>
        <span className="font-medium text-fg-2">{label}:</span>{' '}
        <span className="text-fg-3">{ok ? okText : failText}</span>
      </div>
    </div>
  )
}

function UnknownCard({ unknown, value, onChange }) {
  const [mode, setMode] = useState(null)
  const [inputValue, setInputValue] = useState('')

  function selectMode(m) {
    setMode(m)
    if (m === 'placeholder') onChange('[placeholder]')
    else onChange(null)
  }

  function selectSuggestion(s) {
    onChange(s)
  }

  function commitInput() {
    if (inputValue.trim()) onChange(inputValue.trim())
  }

  const resolved = value !== null

  return (
    <div className={`rounded-lg border p-3 text-sm transition-colors ${resolved ? 'border-border bg-success-soft' : 'border-border bg-surface-2'}`}>
      <p className="font-medium text-fg-1 mb-2">{unknown.question}</p>

      {!mode && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => selectMode('provide')} className="px-2.5 py-1 rounded-md border border-border text-xs text-fg-2 hover:border-border-strong hover:text-coral transition-colors">
            Enter my own answer
          </button>
          <button onClick={() => selectMode('placeholder')} className="px-2.5 py-1 rounded-md border border-border text-xs text-fg-2 hover:border-border-strong hover:text-coral transition-colors">
            Leave a placeholder
          </button>
          {unknown.suggestions?.length > 0 && (
            <button onClick={() => selectMode('suggest')} className="px-2.5 py-1 rounded-md border border-border text-xs text-fg-2 hover:border-border-strong hover:text-coral transition-colors">
              Show suggestions
            </button>
          )}
        </div>
      )}

      {mode === 'provide' && (
        <div className="flex gap-2 mt-1">
          <input
            autoFocus
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitInput()}
            placeholder="Type your answer…"
            className="flex-1 rounded-md border border-border px-2.5 py-1 text-xs outline-none"
          />
          <button onClick={commitInput} disabled={!inputValue.trim()} className="px-3 py-1 rounded-md bg-coral text-fg-on-accent text-xs hover:bg-coral-hover disabled:opacity-40 transition-colors">
            Set
          </button>
          <button onClick={() => { setMode(null); setInputValue('') }} className="px-2 py-1 rounded-md border border-border text-xs text-fg-3 hover:bg-surface-3 transition-colors">
            Back
          </button>
        </div>
      )}

      {mode === 'suggest' && (
        <div className="mt-1 space-y-1">
          {unknown.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => selectSuggestion(s)}
              className="block w-full text-left px-2.5 py-1.5 rounded-md border border-border text-xs text-fg-2 hover:border-border-strong hover:bg-coral-soft transition-colors"
            >
              {s}
            </button>
          ))}
          <button onClick={() => setMode(null)} className="text-xs text-fg-3 hover:text-fg-2 px-1 pt-1 transition-colors">← Back</button>
        </div>
      )}

      {resolved && (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs text-success font-medium">{value}</span>
          <button onClick={() => { setMode(null); onChange(null) }} className="text-xs text-fg-3 hover:text-fg-2 transition-colors">Change</button>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="w-8 h-8 text-coral animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
