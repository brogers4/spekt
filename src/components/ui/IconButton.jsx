import { cn } from '../../lib/utils'

export function IconButton({ icon, onClick, label, active, size = 36, className, ...props }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-transparent transition-colors duration-180',
        active ? 'bg-surface-3 text-fg-1' : 'bg-transparent text-fg-2',
        'hover:bg-surface-3 hover:text-fg-1',
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {icon}
    </button>
  )
}
