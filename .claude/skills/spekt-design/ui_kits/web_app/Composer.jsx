// Composer: raw context in (notes, transcripts, links) → choose artifacts → generate.

const ContextItem = ({ type, name, meta, onRemove }) => {
  const icons = { note: 'file', transcript: 'book', link: 'share', file: 'folder' };
  const colors = { note: '#E8C679', transcript: '#8FB9A8', link: '#8BB3E8', file: 'var(--fg-3)' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
      background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 10,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'var(--bg-3)', color: colors[type], display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icons[type]} size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{meta}</div>
      </div>
      <IconButton name="close" label="Remove" onClick={onRemove} size={28} />
    </div>
  );
};

const ArtifactToggle = ({ kind, title, desc, on, onChange, required, count }) => (
  <button onClick={() => !required && onChange(!on)}
          style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
            padding: '14px 16px', borderRadius: 12, textAlign: 'left',
            background: on ? 'var(--bg-2)' : 'var(--bg-1)',
            border: `1px solid ${on ? 'var(--border-2)' : 'var(--border-1)'}`,
            cursor: required ? 'default' : 'pointer', width: '100%',
            transition: 'all 180ms cubic-bezier(0.32,0.72,0,1)',
          }}>
    <div style={{
      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
      background: on ? 'var(--accent-coral)' : 'transparent',
      border: `1.5px solid ${on ? 'var(--accent-coral)' : 'var(--border-3)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--fg-on-accent)',
    }}>
      {on && <Icon name="check" size={12} style={{ strokeWidth: 3 }} />}
    </div>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <Tag kind={kind} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{title}</span>
        {required && <span style={{ fontSize: 10.5, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>required</span>}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.4 }}>{desc}</div>
    </div>
    {count != null && on && (
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        padding: '4px 8px', borderRadius: 999, background: 'var(--bg-3)', whiteSpace: 'nowrap',
      }}>~{count}</div>
    )}
  </button>
);

const Composer = ({ onBack, onPublish }) => {
  const [items, setItems] = React.useState([
    { id: 1, type: 'transcript', name: 'Strategy sync — Mar 12.txt', meta: '24 min · 4,820 words · 5 speakers' },
    { id: 2, type: 'note',       name: 'Pasted notes from notebook',    meta: 'Pasted 9m ago · 1,140 words' },
    { id: 3, type: 'link',       name: 'docs.acme.com/onboarding-rfc',  meta: 'Fetched 9m ago · 6 sections' },
  ]);
  const [paste, setPaste] = React.useState('');
  const [drafting, setDrafting] = React.useState(false);

  const [picks, setPicks] = React.useState({
    PRFAQ: true,    // required
    PRD: true,      // required
    EPIC: true,
    STORY: true,
    FLOW: true,
    SEQUENCE: false,
    JOURNEY: true,
  });
  const toggle = (k, v) => setPicks(p => ({ ...p, [k]: v }));

  const addPaste = () => {
    if (!paste.trim()) return;
    setItems(it => [...it, { id: Date.now(), type: 'note', name: 'Pasted notes', meta: `${paste.trim().split(/\s+/).length} words` }]);
    setPaste('');
  };

  const generate = () => {
    setDrafting(true);
    setTimeout(() => { setDrafting(false); onPublish(); }, 1300);
  };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 460px',
      minHeight: 'calc(100vh - 56px)',
    }}>
      {/* Left: context inbox */}
      <div style={{ padding: '36px 36px 56px', minWidth: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', fontWeight: 500, marginBottom: 8 }}>New artifact pipeline</div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Drop in what you have. I'll write the rest.
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 15, color: 'var(--fg-3)', maxWidth: 540, lineHeight: 1.55 }}>
            Paste notes, drop a transcript, link a doc. I'll read everything, then generate a linked PR/FAQ, PRD, epics, and stories — plus any diagrams you want.
          </p>
        </div>

        {/* Drop zone */}
        <div style={{
          border: '1.5px dashed var(--border-2)', borderRadius: 14, padding: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          background: 'linear-gradient(180deg, rgba(232,146,124,0.025), transparent 60%)',
          marginBottom: 18,
        }}>
          <Icon name="layers" size={22} style={{ color: 'var(--fg-3)' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', fontWeight: 500 }}>
            Drop transcripts, notes, or PDFs here
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
            …or <a href="#" onClick={e => e.preventDefault()}>browse</a> · <a href="#" onClick={e => e.preventDefault()}>paste a link</a> · <a href="#" onClick={e => e.preventDefault()}>connect Notion</a>
          </div>
        </div>

        {/* Context list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {items.map(it => (
            <ContextItem key={it.id} type={it.type} name={it.name} meta={it.meta}
                         onRemove={() => setItems(items.filter(x => x.id !== it.id))} />
          ))}
        </div>

        {/* Inline paste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Textarea value={paste} onChange={e => setPaste(e.target.value)}
                    placeholder="Or paste raw notes here — meeting fragments, half-thoughts, customer quotes…"
                    rows={4} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
              {paste.trim() ? `${paste.trim().split(/\s+/).length} words` : 'Plain text · Markdown OK'}
            </span>
            <Button variant="secondary" size="sm" leftIcon="plus" onClick={addPaste} disabled={!paste.trim()}>
              Add to context
            </Button>
          </div>
        </div>
      </div>

      {/* Right: pipeline */}
      <aside style={{
        background: 'var(--bg-1)', borderLeft: '1px solid var(--border-1)',
        display: 'flex', flexDirection: 'column', minWidth: 0,
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', fontWeight: 500, marginBottom: 14 }}>Generate</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ArtifactToggle kind="PRFAQ" title="PR/FAQ" required on={picks.PRFAQ} onChange={v => toggle('PRFAQ', v)}
                            desc="Working-backwards press release plus the most likely questions." />
            <ArtifactToggle kind="PRD" title="PRD" required on={picks.PRD} onChange={v => toggle('PRD', v)}
                            desc="Problem, success metrics, scope, acceptance criteria." />
            <ArtifactToggle kind="EPIC" title="Epics" on={picks.EPIC} onChange={v => toggle('EPIC', v)} count={picks.EPIC ? 3 : null}
                            desc="Broken from the PRD. Each links back to a problem statement." />
            <ArtifactToggle kind="STORY" title="User stories" on={picks.STORY} onChange={v => toggle('STORY', v)} count={picks.STORY ? 9 : null}
                            desc="Given / when / then. Estimated and grouped under epics." />
          </div>

          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', fontWeight: 500, marginTop: 28, marginBottom: 14 }}>Optional diagrams</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ArtifactToggle kind="FLOW" title="Flow chart" on={picks.FLOW} onChange={v => toggle('FLOW', v)}
                            desc="Step-by-step user flow with branches and decision points." />
            <ArtifactToggle kind="SEQUENCE" title="Sequence diagram" on={picks.SEQUENCE} onChange={v => toggle('SEQUENCE', v)}
                            desc="System-level call sequence for the proposed change." />
            <ArtifactToggle kind="JOURNEY" title="User journey" on={picks.JOURNEY} onChange={v => toggle('JOURNEY', v)}
                            desc="Stages, touchpoints, emotional arc — useful for PR/FAQ framing." />
          </div>

          {/* Summary */}
          <div style={{
            marginTop: 28, padding: 16, borderRadius: 12,
            background: 'var(--accent-coral-soft)', border: '1px solid #3A2820',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--accent-coral)', fontSize: 11.5, letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase' }}>
              <Pulse /> Plan
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.55 }}>
              From {items.length} sources, I'll produce {Object.values(picks).filter(Boolean).length} linked artifacts.
              Estimated time: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-2)' }}>~90s</span>.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-1)', padding: 20, display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={onBack} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Button>
          <Button variant="primary" leftIcon={drafting ? null : 'sparkles'} onClick={generate} disabled={drafting}
                  style={{ flex: 2, justifyContent: 'center' }}>
            {drafting ? <><Pulse /> Drafting…</> : 'Generate artifacts'}
          </Button>
        </div>
      </aside>
    </div>
  );
};

window.Composer = Composer;
