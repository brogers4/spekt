// Atoms shared across the kit. Inline styles so styles object collisions can't happen.

const Button = ({ variant = 'primary', size = 'md', leftIcon, rightIcon, children, onClick, disabled, style = {}, type = 'button' }) => {
  const base = {
    fontFamily: 'var(--font-body)', fontWeight: 500, borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid transparent',
    transition: 'background-color 180ms cubic-bezier(0.32,0.72,0,1), transform 120ms ease',
    whiteSpace: 'nowrap',
  };
  const sizes = {
    sm: { fontSize: 13, padding: '6px 12px' },
    md: { fontSize: 14, padding: '9px 16px' },
    lg: { fontSize: 15, padding: '12px 20px' },
  };
  const variants = {
    primary: { background: disabled ? 'var(--bg-2)' : 'var(--accent-coral)', color: disabled ? 'var(--fg-4)' : 'var(--fg-on-accent)' },
    secondary: { background: 'var(--bg-3)', color: 'var(--fg-1)', borderColor: 'var(--border-1)' },
    ghost: { background: 'transparent', color: 'var(--fg-2)' },
    danger: { background: 'transparent', color: 'var(--danger)', borderColor: 'var(--border-1)' },
    sage: { background: 'var(--accent-sage)', color: '#0F1A16' },
  };
  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled}
            style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
            onMouseEnter={e => !disabled && variant === 'primary' && (e.currentTarget.style.background = 'var(--accent-coral-hover)')}
            onMouseLeave={e => !disabled && variant === 'primary' && (e.currentTarget.style.background = 'var(--accent-coral)')}>
      {leftIcon && <Icon name={leftIcon} size={size === 'lg' ? 18 : 16} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size={size === 'lg' ? 18 : 16} />}
    </button>
  );
};

const IconButton = ({ name, onClick, label, active, size = 36 }) => (
  <button onClick={onClick} aria-label={label} title={label}
          style={{
            width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, border: '1px solid transparent', background: active ? 'var(--bg-3)' : 'transparent',
            color: active ? 'var(--fg-1)' : 'var(--fg-2)', cursor: 'pointer',
            transition: 'background-color 180ms cubic-bezier(0.32,0.72,0,1)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
          onMouseLeave={e => e.currentTarget.style.background = active ? 'var(--bg-3)' : 'transparent'}>
    <Icon name={name} size={18} />
  </button>
);

const Input = ({ value, onChange, placeholder, leftIcon, style = {}, ...rest }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--bg-1)', border: '1px solid var(--border-1)', borderRadius: 10,
    padding: '0 12px', transition: 'border-color 180ms, box-shadow 180ms', ...style,
  }}>
    {leftIcon && <Icon name={leftIcon} size={16} style={{ color: 'var(--fg-3)' }} />}
    <input value={value} onChange={onChange} placeholder={placeholder} {...rest}
           style={{
             flex: 1, background: 'transparent', border: 'none', outline: 'none',
             color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 14,
             padding: '10px 0',
           }} />
  </div>
);

const Textarea = ({ value, onChange, placeholder, rows = 4, style = {}, ...rest }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} {...rest}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-1)', border: '1px solid var(--border-1)', borderRadius: 10,
              padding: '10px 12px', color: 'var(--fg-1)', fontFamily: 'var(--font-body)',
              fontSize: 14, lineHeight: '20px', outline: 'none', resize: 'vertical', ...style,
            }} />
);

const Tag = ({ children, kind = 'PRD' }) => {
  const palette = {
    PRFAQ:   { bg: '#2A1C18', fg: '#E8927C' },
    PRD:     { bg: '#2A2317', fg: '#E8C679' },
    EPIC:    { bg: '#1A2522', fg: '#8FB9A8' },
    STORY:   { bg: '#182230', fg: '#8BB3E8' },
    FLOW:    { bg: 'var(--bg-3)', fg: 'var(--fg-2)' },
    SEQUENCE:{ bg: 'var(--bg-3)', fg: 'var(--fg-2)' },
    JOURNEY: { bg: 'var(--bg-3)', fg: 'var(--fg-2)' },
  }[kind] || { bg: 'var(--bg-3)', fg: 'var(--fg-2)' };
  return <span style={{
    fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
    padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase',
    background: palette.bg, color: palette.fg,
  }}>{children || kind}</span>;
};

const Chip = ({ children, dot, active, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: 'var(--font-body)', fontSize: 12, padding: '4px 10px', borderRadius: 999,
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: onClick ? 'pointer' : 'default',
    border: `1px solid ${active ? 'var(--border-2)' : 'var(--border-1)'}`,
    background: active ? 'var(--bg-3)' : 'var(--bg-2)',
    color: active ? 'var(--fg-1)' : 'var(--fg-2)',
    transition: 'all 180ms cubic-bezier(0.32,0.72,0,1)',
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dot }} />}
    {children}
  </button>
);

const Avatar = ({ name = 'You', src, size = 28, agent = false }) => {
  if (agent) {
    return <div style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: 'radial-gradient(circle at 30% 30%, #F1A48E, #E8927C 55%, #C46F58)',
      boxShadow: '0 0 0 3px rgba(232, 146, 124, 0.10)',
    }} />;
  }
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const hue = (name.charCodeAt(0) * 37) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: `hsl(${hue} 30% 22%)`, color: `hsl(${hue} 35% 75%)`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', fontSize: size * 0.42, fontWeight: 600,
      border: '1px solid var(--border-1)',
    }}>{initials}</div>
  );
};

const Kbd = ({ children }) => (
  <span style={{
    fontFamily: 'var(--font-mono)', fontSize: 11, padding: '1px 6px', borderRadius: 4,
    background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderBottomWidth: 2,
    color: 'var(--fg-2)', display: 'inline-block', lineHeight: '14px',
  }}>{children}</span>
);

const Card = ({ children, onClick, style = {} }) => (
  <div onClick={onClick} style={{
    background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 14,
    boxShadow: '0 1px 0 0 rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.02)',
    transition: 'background-color 180ms cubic-bezier(0.32,0.72,0,1)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }}
  onMouseEnter={e => onClick && (e.currentTarget.style.background = 'var(--bg-3)')}
  onMouseLeave={e => onClick && (e.currentTarget.style.background = 'var(--bg-2)')}>
    {children}
  </div>
);

const Pulse = ({ color = 'var(--accent-coral)' }) => (
  <span style={{
    width: 7, height: 7, borderRadius: 999, background: color,
    display: 'inline-block', verticalAlign: 'middle',
    animation: 'po-breathe 1.6s ease-in-out infinite',
  }} />
);

Object.assign(window, { Button, IconButton, Input, Textarea, Tag, Chip, Avatar, Kbd, Card, Pulse });
