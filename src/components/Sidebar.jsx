import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'

export default function Sidebar() {
  const { handle, projects } = useWorkspace()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const navigate = useNavigate()

  const recent = projects.slice(0, 8)

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="px-5 py-6 border-b border-gray-700">
        <span className="text-lg font-bold tracking-tight">PO Agent</span>
        <p className="text-xs text-gray-400 mt-0.5">Artifact Generator</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
          }
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NavLink>

        {/* Projects accordion */}
        <div className="pt-2">
          <button
            onClick={() => setProjectsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Projects
            </span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${projectsOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {projectsOpen && (
            <div className="mt-0.5 ml-3 border-l border-gray-700 pl-3 space-y-0.5">
              {recent.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-gray-600 italic">No projects yet</p>
              ) : (
                recent.map((project) => (
                  <NavLink
                    key={project.slug}
                    to={`/project/${project.slug}`}
                    className={({ isActive }) =>
                      `block truncate px-2 py-1.5 rounded text-xs transition-colors ${
                        isActive
                          ? 'text-white bg-gray-700'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`
                    }
                  >
                    {project.name}
                  </NavLink>
                ))
              )}

              {/* New Project subtle button */}
              <button
                onClick={() => navigate('/new-project')}
                className="flex items-center gap-1.5 w-full px-2 py-1.5 mt-1 rounded text-xs text-gray-600 hover:text-indigo-400 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New project
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="px-5 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 truncate">
          {handle ? (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 align-middle" />
              {handle.name}
            </>
          ) : (
            <span className="text-gray-600">No workspace</span>
          )}
        </p>
      </div>
    </aside>
  )
}
