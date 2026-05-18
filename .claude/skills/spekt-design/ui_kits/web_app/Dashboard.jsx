const ARTIFACTS = [
  { id: 'PRFAQ-014', kind: 'PRFAQ',   title: 'Guided imports for new PO teams', desc: 'Press release + FAQ for the 3-step import flow. Drafted from the Mar 12 strategy notes.', status: 'review',   author: 'the agent', updated: '14m ago', starred: true, childCount: { PRD: 1, EPIC: 3, STORY: 9 } },
  { id: 'PRD-0142',  kind: 'PRD',     title: 'Onboarding · v2 (new-team flow)', desc: 'Cuts setup from 8 steps to 3. Detailed AC, success metrics, and rollout plan.', status: 'draft',    author: 'the agent', updated: '14m ago', parent: 'PRFAQ-014' },
  { id: 'EPIC-074',  kind: 'EPIC',    title: 'Stack detection at first run', desc: 'Background scan of repos + tooling. Pre-fills the integration step.', status: 'approved', author: 'You',       updated: 'Yesterday', parent: 'PRD-0142', starred: true },
  { id: 'EPIC-075',  kind: 'EPIC',    title: 'Slack-handle invites', desc: 'Replace email invites with Slack workspace handles when available.', status: 'draft',    author: 'You',       updated: '2d ago', parent: 'PRD-0142' },
  { id: 'STORY-432', kind: 'STORY',   title: 'Detect stack within 4s on P75', desc: 'Background probe finishes before the user reaches step 2.',          status: 'review',   author: 'the agent', updated: 'Mar 9',   parent: 'EPIC-074' },
  { id: 'STORY-433', kind: 'STORY',   title: 'Show "from your brief" badge', desc: 'A discrete chip indicates which sections were lifted from the source.', status: 'draft',  author: 'the agent', updated: 'Mar 9',   parent: 'EPIC-074' },
  { id: 'FLOW-018',  kind: 'FLOW',    title: 'Onboarding step-flow chart', desc: 'Three-step wizard with branch on Slack-detected vs. email fallback.',    status: 'approved', author: 'the agent', updated: 'Mar 11', parent: 'PRD-0142' },
  { id: 'SEQ-022',   kind: 'SEQUENCE',title: 'Stack-detection sequence diagram', desc: 'Client → detector → integration registry → UI hydrate.',             status: 'approved', author: 'the agent', updated: 'Mar 11', parent: 'EPIC-074' },
];

const STATUS_META = {
  draft:    { dot: '#E8C679', label: 'Draft' },
  drafting: { dot: '#E8927C', label: 'Drafting…' },
  review:   { dot: '#8BB3E8', label: 'In review' },
  approved: { dot: '#7CCFA6', label: 'Approved' },
  blocked:  { dot: '#E08585', label: 'Blocked' },
};

const ArtifactCard = ({ a, onClick }) => {
  const sm = STATUS_META[a.status];
  const childTotal = a.childCount && Object.values(a.childCount).reduce((s, n) => s + n, 0);
  return (
    <Card onClick={onClick} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 168 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tag kind={a.kind} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {a.starred && <Icon name="star" size={14} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>{a.id}</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {a.parent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-4)', marginBottom: 4 }}>
            <Icon name="chevronRight" size={10} />
            <span>from {a.parent}</span>
          </div>
        )}
        <h3 style={{
          margin: '4px 0 6px', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
          color: 'var(--fg-1)', lineHeight: 1.35, textWrap: 'pretty',
        }}>{a.title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5, textWrap: 'pretty' }}>{a.desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
        <Chip dot={sm.dot}>{sm.label}</Chip>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          {childTotal != null
            ? <span>{childTotal} linked</span>
            : <><span>{a.author}</span><span>·</span><span>{a.updated}</span></>}
        </div>
      </div>
    </Card>
  );
};

const Dashboard = ({ onOpen, onCompose }) => {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all',      label: 'All' },
    { id: 'PRFAQ',    label: 'PR/FAQs' },
    { id: 'PRD',      label: 'PRDs' },
    { id: 'EPIC',     label: 'Epics' },
    { id: 'STORY',    label: 'Stories' },
    { id: 'diagram',  label: 'Diagrams' },
  ];
  const list = ARTIFACTS.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'diagram') return ['FLOW', 'SEQUENCE', 'JOURNEY'].includes(a.kind);
    return a.kind === filter;
  });
  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero band — quiet, just text */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', fontWeight: 500, marginBottom: 8 }}>
            Thursday · Mar 14
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Good morning, Mira.
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 15, color: 'var(--fg-3)', maxWidth: 580 }}>
            Two PRDs out for review, one PRFAQ waiting on a yes. The agent is mid-way through linked stories.
          </p>
        </div>
        <Button variant="primary" size="lg" leftIcon="plus" onClick={onCompose}>
          New artifact
        </Button>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</Chip>
        ))}
        <div style={{ flex: 1 }} />
        <IconButton name="sliders" label="View options" size={32} />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16,
      }}>
        {list.map(a => <ArtifactCard key={a.id} a={a} onClick={() => onOpen(a)} />)}
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
window.ARTIFACTS = ARTIFACTS;
