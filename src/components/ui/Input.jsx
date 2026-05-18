import { cn } from '../../lib/utils'

export function Input({ leftIcon, className, containerClassName, ...props }) {
  return (
    <div className={cn(
      'flex items-center gap-2.5 bg-surface-1 border border-border rounded-md px-3 transition-colors',
      'focus-within:border-border-strong',
      containerClassName
    )}>
      {leftIcon && <span className="text-fg-3 shrink-0 w-4 h-4">{leftIcon}</span>}
      <input
        className={cn(
          'flex-1 bg-transparent border-none outline-none text-fg-1 font-body text-sm py-2.5 placeholder:text-fg-4',
          className
        )}
        {...props}
      />
    </div>
  )
}
