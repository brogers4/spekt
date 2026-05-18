import { cn } from '../../lib/utils'

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full bg-surface-1 border border-border rounded-md px-3 py-2.5',
        'text-fg-1 font-body text-sm leading-5 outline-none resize-vertical',
        'placeholder:text-fg-4 focus:border-border-strong transition-colors',
        className
      )}
      {...props}
    />
  )
}
