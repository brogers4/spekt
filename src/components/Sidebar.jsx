import { NavLink, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { useLayout } from '../context/LayoutContext'
import { hasApiKey, getCliMode } from '../lib/claude'
import logoMark from '../assets/spekt-icon.png'
import logoWordmark from '../assets/spekt-wordmark.png'

function NavItem({ to, end, icon, label, count, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-[13.5px] transition-colors duration-180 border border-transparent',
          isActive
            ? 'bg-surface-3 text-fg-1'
            : 'text-fg-2 hover:bg-surface-2 hover:text-fg-1',
          collapsed ? 'justify-center' : '',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span className={['shrink-0', isActive ? 'text-fg-1' : 'text-fg-3'].join(' ')}>
            {icon}
          </span>
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
          {!collapsed && count != null && (
            <span className="font-mono text-[11px] text-fg-3">{count}</span>
          )}
        </>
      )}
    </NavLink>
  )
}

function SectionLabel({ children, collapsed }) {
  if (collapsed) return <div className="my-2 border-t border-border" />
  return (
    <div className="px-2.5 pt-4 pb-1.5 text-[11px] font-medium tracking-[0.08em] uppercase text-fg-3">
      {children}
    </div>
  )
}

export default function Sidebar() {
  const { projects } = useWorkspace()
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useLayout()
  const navigate = useNavigate()
  const apiKeySet = hasApiKey()
  const cliMode = getCliMode()
  const showWarning = !cliMode && !apiKeySet

  const recent = projects.slice(0, 8)

  const iconHome = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
  const iconFolder = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  )
  const iconSettings = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
  const iconPlus = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
  const iconChevronLeft = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
  const iconChevronRight = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )

  const sidebarContent = (
    <aside
      className={[
        'bg-surface-1 border-r border-border flex flex-col h-full overflow-hidden shrink-0 transition-[width] duration-[260ms] ease-out',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      {/* Header — wordmark + collapse toggle */}
      <div className={['flex items-center border-b border-border h-14 shrink-0', collapsed ? 'justify-center px-3' : 'px-4 gap-2.5'].join(' ')}>
        {collapsed ? (
          <img src={logoMark} alt="spekt." className="w-6 h-6 shrink-0" />
        ) : (
          <div className="flex-1 min-w-0">
            <img src={logoWordmark} alt="spekt." className="h-5 w-auto" />
            <div className="text-[11px] text-fg-3 mt-1">Artifact generator</div>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-7 h-7 flex items-center justify-center rounded-md text-fg-3 hover:text-fg-2 hover:bg-surface-3 transition-colors shrink-0"
        >
          {collapsed ? iconChevronRight : iconChevronLeft}
        </button>
      </div>

      {/* New Project CTA */}
      <div className={['pt-3 shrink-0', collapsed ? 'px-2.5' : 'px-3'].join(' ')}>
        <button
          onClick={() => { navigate('/new-project'); setMobileOpen(false) }}
          title={collapsed ? 'New project' : undefined}
          className={[
            'flex items-center gap-2 rounded-md bg-coral text-fg-on-accent text-sm font-medium transition-colors hover:bg-coral-hover',
            collapsed ? 'w-full justify-center p-2' : 'w-full px-3 py-2',
          ].join(' ')}
        >
          {iconPlus}
          {!collapsed && 'New project'}
        </button>
      </div>

      {/* Nav */}
      <nav className={['flex-1 overflow-y-auto pt-2 pb-2', collapsed ? 'px-2' : 'px-3'].join(' ')}>
        <div className="flex flex-col gap-0.5">
          <NavItem to="/" end icon={iconHome} label="Home" collapsed={collapsed} />
          <NavItem to="/projects" icon={iconFolder} label="All projects" count={projects.length || undefined} collapsed={collapsed} />
        </div>

        {!collapsed && recent.length > 0 && (
          <>
            <SectionLabel collapsed={collapsed}>Projects</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {recent.map((project) => (
                <NavLink
                  key={project.slug}
                  to={`/project/${project.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      'block truncate px-2.5 py-1.5 rounded-md text-xs transition-colors',
                      isActive ? 'text-fg-1 bg-surface-3' : 'text-fg-3 hover:text-fg-1 hover:bg-surface-2',
                    ].join(' ')
                  }
                >
                  {project.name}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className={['border-t border-border shrink-0 pt-2 pb-3', collapsed ? 'px-2' : 'px-3'].join(' ')}>
        <NavItem to="/settings" icon={iconSettings} label="Settings" collapsed={collapsed} />

        {!collapsed && showWarning && (
          <div className="mt-2 px-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" title="Claude API key not set" />
            <span className="text-xs text-fg-3">API key not set</span>
          </div>
        )}
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar — in layout flow */}
      <div className="hidden md:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={[
          'md:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-[260ms] ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Always expanded on mobile */}
        <aside className="bg-surface-1 border-r border-border flex flex-col h-full w-60">
          <div className="flex items-center gap-2.5 px-4 border-b border-border h-14 shrink-0">
            <div className="flex-1 min-w-0">
              <img src={logoWordmark} alt="spekt." className="h-5 w-auto" />
              <div className="text-[11px] text-fg-3 mt-1">Artifact generator</div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-fg-3 hover:text-fg-2 hover:bg-surface-3 transition-colors"
            >
              {iconChevronLeft}
            </button>
          </div>
          <div className="px-3 pt-3 shrink-0">
            <button
              onClick={() => { navigate('/new-project'); setMobileOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-coral text-fg-on-accent text-sm font-medium hover:bg-coral-hover transition-colors"
            >
              {iconPlus}
              New project
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto pt-2 pb-2 px-3">
            <div className="flex flex-col gap-0.5">
              <NavItem to="/" end icon={iconHome} label="Home" collapsed={false} />
              <NavItem to="/projects" icon={iconFolder} label="All projects" count={projects.length || undefined} collapsed={false} />
            </div>
            {recent.length > 0 && (
              <>
                <SectionLabel collapsed={false}>Projects</SectionLabel>
                <div className="flex flex-col gap-0.5">
                  {recent.map((project) => (
                    <NavLink
                      key={project.slug}
                      to={`/project/${project.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        ['block truncate px-2.5 py-1.5 rounded-md text-xs transition-colors',
                          isActive ? 'text-fg-1 bg-surface-3' : 'text-fg-3 hover:text-fg-1 hover:bg-surface-2'].join(' ')
                      }
                    >
                      {project.name}
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </nav>
          <div className="border-t border-border shrink-0 pt-2 pb-3 px-3">
            <NavItem to="/settings" icon={iconSettings} label="Settings" collapsed={false} />
          </div>
        </aside>
      </div>
    </>
  )
}
