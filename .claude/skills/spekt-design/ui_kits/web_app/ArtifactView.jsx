const Section = ({ title, eyebrow, children }) => (
  <section style={{ marginBottom: 36 }}>
    {eyebrow && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', fontWeight: 500, marginBottom: 8 }}>{eyebrow}</div>}
    <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>{title}</h2>
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--fg-2)' }}>{children}</div>
  </section>
);

const Criterion = ({ id, children, status = 'pending' }) => {
  const dot = { pending: 'var(--border-3)', met: 'var(--success)' }[status];
  return (
    <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border-1)' }}>
      <span style={{ width: 14, height: 14, borderRadius: 999, border: `1.5px solid ${dot}`, marginTop: 4, flexShrink: 0, background: status === 'met' ? dot : 'transparent' }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{id}</span>
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--fg-1)', lineHeight: 1.5 }}>{children}</div>
      </div>
    </li>
  );
};

const InspectorRow = ({ label, children }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-1)' }}>
    <span style={{ width: 96, fontSize: 12, color: 'var(--fg-3)', flexShrink: 0 }}>{label}</span>
    <div style={{ flex: 1, fontSize: 13.5, color: 'var(--fg-1)' }}>{children}</div>
  </div>
);

const ArtifactView = ({ artifact, onBack }) => {
  const a = artifact || { id: 'PRD-0142', kind: 'PRD', title: 'Onboarding · v2 (new-team flow)', author: 'You', updated: '14m ago' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', minHeight: 'calc(100vh - 56px)' }}>
      {/* Content */}
      <article style={{ padding: '40px 56px 80px', maxWidth: 820, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Tag kind={a.kind} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{a.id}</span>
          <span style={{ color: 'var(--fg-4)', fontSize: 11 }}>·</span>
          <Chip dot="#E8C679">Draft</Chip>
        </div>
        <h1 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.02em', lineHeight: 1.1, textWrap: 'balance' }}>
          {a.title}
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 16, color: 'var(--fg-3)', lineHeight: 1.55, textWrap: 'pretty' }}>
          A guided import flow for new product-owner teams. Replaces 8 manual steps with a 3-step wizard that infers stack, invites teammates by Slack handle, and seeds a first artifact from your existing brief doc.
        </p>

        <Section eyebrow="01" title="Problem">
          New PO teams currently spend the first week wiring up integrations and re-typing context the agent could pick up from their existing tools. The result is a flat first-session, a high drop-off at step 4 (Slack invite), and a perception that the product is "another tool to learn."
        </Section>

        <Section eyebrow="02" title="What success looks like">
          <p>Within 30 days of launch:</p>
          <ul style={{ paddingLeft: 22, marginTop: 8 }}>
            <li>70% of new teams complete setup in one sitting (vs 41% today).</li>
            <li>Time-to-first-artifact drops below 15 minutes, median.</li>
            <li>Step-4 drop-off (Slack invite) falls below 8%.</li>
          </ul>
        </Section>

        <Section eyebrow="03" title="Acceptance criteria">
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <Criterion id="AC-01" status="met">Stack detection runs in the background and pre-fills the integration step within 4s on a P75 connection.</Criterion>
            <Criterion id="AC-02" status="met">Slack invites use the workspace handle, not email, when a Slack connection exists.</Criterion>
            <Criterion id="AC-03">A first artifact is seeded from the brief doc, with a labelled "from your brief" badge in the side rail.</Criterion>
            <Criterion id="AC-04">All three steps are reachable via keyboard; focus order is documented.</Criterion>
            <Criterion id="AC-05">Step-4 drop-off is instrumented with a discrete event ('onboarding.invite.skipped').</Criterion>
          </ol>
        </Section>

        <Section eyebrow="04" title="Out of scope">
          SSO provisioning, custom-domain workspaces, and multi-org switching. The bulk-import variant (CSV) lives in <a href="#">PRD-0140</a>.
        </Section>
      </article>

      {/* Inspector */}
      <aside style={{
        borderLeft: '1px solid var(--border-1)', background: 'var(--bg-1)',
        padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24,
        position: 'sticky', top: 56, alignSelf: 'flex-start', height: 'calc(100vh - 56px)', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" size="sm" leftIcon="check" style={{ flex: 1, justifyContent: 'center' }}>Approve</Button>
          <IconButton name="share" label="Share" />
          <IconButton name="copy" label="Copy link" />
          <IconButton name="moreH" label="More" />
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', fontWeight: 500, marginBottom: 4 }}>Details</div>
          <InspectorRow label="Owner"><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name="Mira K." size={20} />Mira Kondo</div></InspectorRow>
          <InspectorRow label="Drafted by"><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar agent size={20} /><span>the agent</span></div></InspectorRow>
          <InspectorRow label="Status"><Chip dot="#E8C679">Draft</Chip></InspectorRow>
          <InspectorRow label="Updated">14 minutes ago</InspectorRow>
          <InspectorRow label="Source brief"><a href="#" style={{ fontSize: 13.5 }}>strategy-sync-mar-12.txt</a></InspectorRow>
          <InspectorRow label="Parent"><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Tag kind="PRFAQ" /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>PRFAQ-014</span></div></InspectorRow>
          <InspectorRow label="Children"><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Tag kind="EPIC">3 EPICS</Tag><Tag kind="STORY">9 STORIES</Tag><Tag kind="FLOW">FLOW</Tag></div></InspectorRow>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', fontWeight: 500, marginBottom: 10 }}>Agent suggestions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{ textAlign: 'left', background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '10px 12px', color: 'var(--fg-1)', cursor: 'pointer', fontSize: 13, lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, color: 'var(--accent-coral)', fontSize: 11 }}><Pulse /> Refine AC-03</div>
              Add a measurable trigger — when "from your brief" badge is acknowledged vs ignored.
            </button>
            <button style={{ textAlign: 'left', background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '10px 12px', color: 'var(--fg-1)', cursor: 'pointer', fontSize: 13, lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
              <div style={{ color: 'var(--accent-coral)', fontSize: 11, marginBottom: 2 }}>Add section</div>
              "Risks &amp; mitigations" — three options based on prior PRDs in this space.
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

window.ArtifactView = ArtifactView;
