import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiKey, setApiKey, hasApiKey } from '../lib/claude'

export default function Settings() {
  const navigate = useNavigate()
  const [keyInput, setKeyInput] = useState(getApiKey())
  const [revealed, setRevealed] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

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

  const isDirty = keyInput !== getApiKey()

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">Dashboard</button>
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-gray-600">Settings</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">AI</h2>
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
          <div className="px-5 py-4">
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
              Claude API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={revealed ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setError(null) }}
                placeholder="sk-ant-..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm font-mono shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
            <p className="mt-1.5 text-xs text-gray-400">
              Your key is stored locally in your browser and never sent to PO Agent servers.{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                Get a key →
              </a>
            </p>
          </div>

          <div className="px-5 py-4 bg-gray-50 flex items-center justify-between rounded-b-lg">
            {hasApiKey() && !isDirty ? (
              <span className="text-xs text-green-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                API key configured
              </span>
            ) : saved ? (
              <span className="text-xs text-green-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Saved
              </span>
            ) : <span />}
            <button
              type="submit"
              disabled={!isDirty}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
