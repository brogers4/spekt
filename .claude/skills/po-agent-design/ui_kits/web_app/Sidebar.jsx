const NavItem = ({ icon, label, count, active, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '8px 10px', borderRadius: 8, border: 'none',
    background: active ? 'var(--bg-3)' : 'transparent',
    color: active ? 'var(--fg-1)' : 'var(--fg-2)', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: 13.5, textAlign: 'left',
    transition: 'background-color 180ms cubic-bezier(0.32,0.72,0,1)',
  }}
  onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--bg-2)')}
  onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
    <Icon name={icon} size={16} style={{ color: active ? 'var(--fg-1)' : 'var(--fg-3)' }} />
    <span style={{ flex: 1 }}>{label}</span>
    {count != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{count}</span>}
  </button>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--fg-3)', fontWeight: 500,
    padding: '14px 10px 6px',
  }}>{children}</div>
);

const Sidebar = ({ route, onNavigate }) => (
  <aside style={{
    width: 240, flexShrink: 0, background: 'var(--bg-1)',
    borderRight: '1px solid var(--border-1)', display: 'flex', flexDirection: 'column',
    height: '100vh', position: 'sticky', top: 0,
  }}>
    {/* Workspace switcher */}
    <button style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
      border: 'none', background: 'transparent', cursor: 'pointer',
      borderBottom: '1px solid var(--border-1)',
    }}>
      <img src="../../assets/logo-mark.svg" width="22" height="22" alt="" />
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>po agent</div>
        <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Acme · Platform</div>
      </div>
      <Icon name="chevronDown" size={14} style={{ color: 'var(--fg-3)' }} />
    </button>

    {/* Primary CTA */}
    <div style={{ padding: '14px 12px 8px' }}>
      <Button variant="primary" size="md" leftIcon="plus" onClick={() => onNavigate('composer')}
              style={{ width: '100%', justifyContent: 'center' }}>
        New artifact
      </Button>
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, padding: '4px 12px 12px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon="home"    label="Library"   count={24} active={route === 'dashboard'} onClick={() => onNavigate('dashboard')} />
        <NavItem icon="inbox"   label="Inbox"     count={3}  onClick={() => onNavigate('dashboard')} />
        <NavItem icon="clock"   label="Drafts"    count={6}  onClick={() => onNavigate('dashboard')} />
        <NavItem icon="star"    label="Starred"             onClick={() => onNavigate('dashboard')} />
      </div>

      <SectionLabel>Spaces</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon="folder"  label="Platform"  active={false} onClick={() => onNavigate('dashboard')} />
        <NavItem icon="folder"  label="Growth"               onClick={() => onNavigate('dashboard')} />
        <NavItem icon="folder"  label="Onboarding"            onClick={() => onNavigate('dashboard')} />
      </div>

      <SectionLabel>Library</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon="book"    label="Templates" onClick={() => onNavigate('dashboard')} />
        <NavItem icon="layers"  label="Snippets"  onClick={() => onNavigate('dashboard')} />
      </div>
    </nav>

    {/* Footer */}
    <div style={{ borderTop: '1px solid var(--border-1)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <a href="https://github.com" target="_blank" rel="noreferrer"
         style={{
           display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8,
           border: '1px solid var(--border-1)', background: 'var(--bg-2)',
           textDecoration: 'none', color: 'var(--fg-2)', fontSize: 12,
         }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span style={{ flex: 1 }}>Open source</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>v0.4.2</span>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name="Mira K." size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--fg-1)' }}>Mira Kondo</div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>mira@acme.com</div>
        </div>
        <IconButton name="settings" label="Settings" size={32} />
      </div>
    </div>
  </aside>
);

window.Sidebar = Sidebar;
