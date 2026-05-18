const TopBar = ({ title, crumbs = [], right, onBack }) => (
  <header style={{
    height: 56, display: 'flex', alignItems: 'center', gap: 14,
    padding: '0 28px', borderBottom: '1px solid var(--border-1)',
    background: 'rgba(15, 18, 22, 0.72)', backdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 10,
  }}>
    {onBack && (
      <button onClick={onBack} style={{
        width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-1)',
        background: 'var(--bg-2)', cursor: 'pointer', color: 'var(--fg-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="arrowLeft" size={14} />
      </button>
    )}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{c}</span>
          <Icon name="chevronRight" size={12} style={{ color: 'var(--fg-4)' }} />
        </React.Fragment>
      ))}
      <h1 style={{
        margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600,
        color: 'var(--fg-1)', letterSpacing: '-0.01em', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{title}</h1>
    </div>

    {/* search */}
    <button style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: 280, padding: '7px 12px', borderRadius: 999,
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      color: 'var(--fg-3)', cursor: 'pointer', fontSize: 13,
    }}>
      <Icon name="search" size={14} />
      <span style={{ flex: 1, textAlign: 'left' }}>Search artifacts…</span>
      <Kbd>⌘K</Kbd>
    </button>

    {right}
  </header>
);

window.TopBar = TopBar;
