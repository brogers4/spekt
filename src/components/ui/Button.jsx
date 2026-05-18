import { cn } from '../../lib/utils'

const sizeClasses = {
  sm: 'text-[13px] px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-[15px] px-5 py-3 gap-2',
}

const iconSize = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-[18px] h-[18px]',
}

const variantClasses = {
  primary: 'bg-coral text-fg-on-accent hover:bg-coral-hover disabled:bg-surface-3 disabled:text-fg-4 disabled:cursor-not-allowed',
  secondary: 'bg-surface-3 text-fg-1 border border-border hover:bg-surface-4 disabled:opacity-40 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-fg-2 hover:bg-surface-3 hover:text-fg-1 disabled:opacity-40 disabled:cursor-not-allowed',
  danger: 'bg-transparent text-danger border border-border hover:bg-danger-soft disabled:opacity-40 disabled:cursor-not-allowed',
  sage: 'bg-sage text-[#0F1A16] hover:bg-sage-hover disabled:opacity-40 disabled:cursor-not-allowed',
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center font-medium rounded-md whitespace-nowrap transition-colors duration-180',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {leftIcon && <span className={iconSize[size]}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={iconSize[size]}>{rightIcon}</span>}
    </button>
  )
}
