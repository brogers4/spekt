import { cn } from '../../lib/utils'

export function Chip({ children, dot, active, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all duration-180',
        active
          ? 'bg-surface-3 border-border-strong text-fg-1'
          : 'bg-surface-2 border-border text-fg-2',
        onClick ? 'cursor-pointer hover:bg-surface-3 hover:text-fg-1' : 'cursor-default',
        className
      )}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dot }}
        />
      )}
      {children}
    </button>
  )
}
