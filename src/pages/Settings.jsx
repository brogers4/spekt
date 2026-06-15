import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLayout } from '../context/LayoutContext'
import { getApiKey, setApiKey, hasApiKey, getCliMode, setCliMode, getAuthor, setAuthor } from '../lib/claude'

export default function Settings() {
  const navigate = useNavigate()
  const { setTitle, setCrumbs, setBack } = useLayout()

  useEffect(() => {
    setTitle('Settings')
    setCrumbs([])
    setBack(null)
  }, [])
  const [keyInput, setKeyInput] = useState(getApiKey())
  const [revealed, setRevealed] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [cliMode, setCliModeState] = useState(getCliMode())
  const [authorInput, setAuthorInput] = useState(getAuthor())
  const [authorSaved, setAuthorSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    setError(null)
    try {
      setApiKey(keyInput)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleMethodChange(useCliMode) {
    setCliModeState(useCliMode)
    setCliMode(useCliMode)
  }

  function handleAuthorSave(e) {
    e.preventDefault()
    setAuthor(authorInput)
    setAuthorSaved(true)
    setTimeout(() => setAuthorSaved(false), 2500)
  }

  const isAuthorDirty = authorInput !== getAuthor()

  const isDirty = keyInput !== getApiKey()

  return (
    <div className="max-w-[720px] mx-auto py-10 px-8">
      <h1 className="text-2xl font-bold text-fg-1 mb-8 font-display">Settings</h1>

      {/* Author */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-fg-3 uppercase tracking-wide mb-4">Author</h2>
        <form onSubmit={handleAuthorSave} className="bg-surface-2 border border-border rounded-lg shadow-sm divide-y divide-border">
          <div className="px-5 py-4">
            <label htmlFor="author-name" className="block text-sm font-medium text-fg-2 mb-1">
              Your name
            </label>
            <input
              id="author-name"
              type="text"
              value={authorInput}
              onChange={(e) => { setAuthorInput(e.target.value); setAuthorSaved(false) }}
              placeholder="e.g. Jane Smith"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm shadow-sm outline-none focus:border-border-strong transition-colors bg-surface-1 text-fg-1"
            />
            <p className="mt-1.5 text-xs text-fg-3">
              Used as the author field in generated PRDs and other artifacts.
            </p>
          </div>
          <div className="px-5 py-4 bg-surface-1 flex items-center justify-between rounded-b-lg">
            {authorSaved ? (
              <span className="text-xs text-success flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Saved
              </span>
            ) : <span />}
            <button
              type="submit"
              disabled={!isAuthorDirty}
              className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-fg-on-accent hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </section>

      {/* Generation Method */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-fg-3 uppercase tracking-wide mb-4">Generation method</h2>
        <div className="bg-surface-2 border border-border rounded-lg shadow-sm divide-y divide-border">
          <label className={`flex items-start gap-4 px-5 py-4 cursor-pointer rounded-t-lg transition-colors ${!cliMode ? 'bg-coral-soft' : 'hover:bg-surface-1'}`}>
            <input
              type="radio"
              name="generation-method"
              checked={!cliMode}
              onChange={() => handleMethodChange(false)}
              className="mt-0.5 accent-coral"
            />
            <div>
              <p className="text-sm font-medium text-fg-1">Claude API</p>
              <p className="text-xs text-fg-3 mt-0.5">
                Generate artifacts directly in the app using your Anthropic API key. Requires a separate Anthropic account with credits.{' '}
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">
                  Sign up →
                </a>
              </p>
            </div>
          </label>

          <label className={`flex items-start gap-4 px-5 py-4 cursor-pointer rounded-b-lg transition-colors ${cliMode ? 'bg-coral-soft' : 'hover:bg-surface-1'}`}>
            <input
              type="radio"
              name="generation-method"
              checked={cliMode}
              onChange={() => handleMethodChange(true)}
              className="mt-0.5 accent-coral"
            />
            <div>
              <p className="text-sm font-medium text-fg-1">Claude Code / Pro</p>
              <p className="text-xs text-fg-3 mt-0.5">
                Use the Claude Code CLI with your existing Claude Pro subscription. spekt. will give you the exact commands to run — no API key needed.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* API Key — only shown in API mode */}
      {!cliMode && (
        <section>
          <h2 className="text-sm font-semibold text-fg-3 uppercase tracking-wide mb-4">API key</h2>
          <form onSubmit={handleSave} className="bg-surface-2 border border-border rounded-lg shadow-sm divide-y divide-border">
            <div className="px-5 py-4">
              <label htmlFor="api-key" className="block text-sm font-medium text-fg-2 mb-1">
                Claude API key
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={revealed ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => { setKeyInput(e.target.value); setError(null) }}
                  placeholder="sk-ant-..."
                  className="w-full rounded-lg border border-border px-3 py-2 pr-10 text-sm font-mono shadow-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setRevealed((r) => !r)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg-2 transition-colors"
                  title={revealed ? 'Hide' : 'Reveal'}
                >
                  {revealed ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
              <p className="mt-1.5 text-xs text-fg-3">
                Your key is stored locally in your browser and never sent to spekt. servers.{' '}
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">
                  Get a key →
                </a>
              </p>
            </div>

            <div className="px-5 py-4 bg-surface-1 flex items-center justify-between rounded-b-lg">
              {hasApiKey() && !isDirty ? (
                <span className="text-xs text-success flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                  API key configured
                </span>
              ) : saved ? (
                <span className="text-xs text-success flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              ) : <span />}
              <button
                type="submit"
                disabled={!isDirty}
                className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-fg-on-accent hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}
