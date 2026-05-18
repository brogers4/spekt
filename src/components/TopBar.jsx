import { useNavigate } from 'react-router-dom'
import { useLayout } from '../context/LayoutContext'

export default function TopBar() {
  const { title, crumbs, setMobileOpen } = useLayout()
  const navigate = useNavigate()

  return (
    <header className="h-14 shrink-0 sticky top-0 z-10 flex items-center gap-3 px-7 border-b border-border bg-canvas/80 backdrop-blur-xl">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden p-1.5 -ml-1 rounded-md text-fg-3 hover:text-fg-2 hover:bg-surface-2 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Breadcrumbs + title */}
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(crumb.href)}
              className="text-[13px] text-fg-3 hover:text-fg-2 transition-colors"
            >
              {crumb.label}
            </button>
            <svg className="w-3 h-3 text-fg-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        ))}
        {title && (
          <span className="text-[13px] font-medium text-fg-1 truncate">
            {title}
          </span>
        )}
      </div>
    </header>
  )
}
