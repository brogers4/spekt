# Skill: generate-epics

Generate an Epics document for a spekt. project using the canonical template. Epics bridge the PRD's requirements and granular user stories.

## Steps

### Step 1 — Load context

Read the following, in order of priority:
1. `projects/{slug}/README.md` — project description
2. `projects/{slug}/{slug}-prd.md` — PRD (PRIMARY source of truth; use requirement IDs for traceability)
3. `projects/{slug}/{slug}-prfaq.md` — PRFAQ (secondary context for product vision)
4. All files in `projects/{slug}/context/` that are text-readable
5. `src/templates/epics.template.md` — canonical template

### Step 2 — Generate the Epics document

Follow the template exactly. Rules:
- Cover **all** PRD requirements — do not miss any PRD-NNN IDs
- Do not over-invent epics; a simple project may need only one or two
- Each epic must be fully deliverable and user-testable
- Order epics by recommended implementation sequence (highest priority, lowest dependency risk first)
- "Planned Scope" items use short, readable feature labels — NOT "As a user…" format
- Use `[TBD]` for genuinely unknown items; do not invent
- Omit the Open Questions section for an epic if there are none
- Output only the Epics markdown — no preamble or commentary

### Step 3 — Identify review items

After generating, check for:
- PRD requirements not covered by any epic (coverage gaps)
- `[TBD]` placeholders that need resolution before implementation
- Ordering or dependency assumptions that may be wrong
- Epics that seem too broad or too narrow

Present findings as a numbered list with type labels (`gap`, `question`, or `decision`). Skip this step if everything looks solid.

### Step 4 — Capture to memory

Save to memory:
- Names of all epics in recommended order
- Any key decisions made during generation (e.g., why certain requirements were grouped)

### Step 5 — Save and iterate

Offer to save the output to `projects/{slug}/{slug}-epics.md`. If the user provides feedback, revise and re-save. Accept revisions until the user is satisfied.
