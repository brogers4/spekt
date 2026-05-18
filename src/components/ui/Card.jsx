import { cn } from '../../lib/utils'

export function Card({ children, onClick, className, ...props }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface-2 border border-border rounded-lg shadow-1 transition-colors duration-180',
        onClick && 'cursor-pointer hover:bg-surface-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
