import Anthropic from '@anthropic-ai/sdk'

// One-time migration from old 'po-agent:' localStorage prefix to 'spekt:'
;['claude-api-key', 'cli-mode'].forEach(k => {
  const val = localStorage.getItem(`po-agent:${k}`)
  if (val) { localStorage.setItem(`spekt:${k}`, val); localStorage.removeItem(`po-agent:${k}`) }
})

const KEY = 'spekt:claude-api-key'
const KEY_PATTERN = /^sk-ant-/
const CLI_MODE_KEY = 'spekt:cli-mode'

export function getCliMode() {
  return localStorage.getItem(CLI_MODE_KEY) === 'true'
}

export function setCliMode(enabled) {
  if (enabled) {
    localStorage.setItem(CLI_MODE_KEY, 'true')
  } else {
    localStorage.removeItem(CLI_MODE_KEY)
  }
}

const AUTHOR_KEY = 'spekt:author'

export function getAuthor() {
  return localStorage.getItem(AUTHOR_KEY) ?? ''
}

export function setAuthor(name) {
  const trimmed = name.trim()
  if (trimmed) {
    localStorage.setItem(AUTHOR_KEY, trimmed)
  } else {
    localStorage.removeItem(AUTHOR_KEY)
  }
}

export function getApiKey() {
  return localStorage.getItem(KEY) ?? ''
}

export function setApiKey(key) {
  const trimmed = key.trim()
  if (trimmed && !KEY_PATTERN.test(trimmed)) {
    throw new Error('Invalid API key format. Claude API keys start with "sk-ant-".')
  }
  if (trimmed) {
    localStorage.setItem(KEY, trimmed)
  } else {
    localStorage.removeItem(KEY)
  }
}

export function hasApiKey() {
  return KEY_PATTERN.test(getApiKey())
}

export function createClient() {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No API key configured.')
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

// Phase 1: identify unknowns needed to generate a PRFAQ
export async function identifyPrfaqUnknowns({ readme, contextFiles, signal }) {
  const client = createClient()

  const contextBlock = contextFiles.length
    ? contextFiles.map((f) => `### ${f.filename}\n${f.content}`).join('\n\n')
    : '(No context files provided)'

  const message = await client.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a PRFAQ generation assistant. Your job is to identify what specific information is missing or unknown before you can generate a high-quality PRFAQ following the working-backwards methodology.

Return ONLY a valid JSON array (no markdown, no explanation) of unknowns in this format:
[{ "field": "snake_case_field_name", "question": "Plain question to ask the user", "suggestions": ["Option 1", "Option 2"] }]

Rules:
- Only include genuinely unknown items that are required for the PRFAQ
- Always check for: company/product name, target customer segment, proposed launch date, dateline city, media outlet, spokesperson name and title, website URL
- Provide 2-3 concrete suggestions for each unknown based on context clues
- If context clearly answers a question, do NOT include it as an unknown
- Return an empty array [] if no unknowns exist`,
      messages: [
        {
          role: 'user',
          content: `Project README:\n${readme || '(none)'}\n\nContext files:\n${contextBlock}\n\nWhat information is missing to generate this PRFAQ?`,
        },
      ],
    },
    { signal }
  )

  const text = message.content[0].text.trim()
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    console.error('Failed to parse unknowns response:', text)
    return []
  }
}

// Generate a PRD (no upfront questioning — TBD markers are flagged for post-generation review)
export async function generatePrd({ readme, contextFiles, prfaqContent, template, author, signal }) {
  const client = createClient()

  const contextBlock = contextFiles.length
    ? contextFiles.map((f) => `### ${f.filename}\n${f.content}`).join('\n\n')
    : '(No context files provided)'

  const today = new Date().toISOString().slice(0, 10)

  const stream = await client.messages.stream(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: `You are an expert product manager generating a PRD. Follow the template and rules below exactly.

TEMPLATE:
${template}

${prfaqContent ? `PRFAQ (HIGHEST PRIORITY CONTEXT — treat as the authoritative source for product vision, customer segment, problem framing, and solution direction):
${prfaqContent}

` : ''}RULES:
SCOPE:
- This PRD covers the entire project — its full vision, goals, and scope. Do NOT focus on a single feature or sub-feature unless the project itself is a single feature.
- If context files describe multiple features, capabilities, or user flows, synthesize them into a holistic product view.

CONTENT:
- Fill in all sections using the provided context. Where information is genuinely unknown, insert [TBD] — do not invent details.
- The document should read as a cohesive narrative. Bullets and tables are allowed but should complement the prose, not replace it.
- Status should be "Draft" for all newly generated PRDs.
- Revision History: set Rev to 1, Date to ${today}, Author to ${author || '[Author]'}, Summary to "Initial draft".
- Keep the body (everything before appendices) to approximately 6 pages or fewer. Be concise.

OPTIONAL SECTIONS:
- Wireframes, lo-fi mockups, UI/UX diagrams, architecture diagrams: include ONLY if relevant material is present in the provided context. If not, omit the section entirely — do NOT insert [TBD] or placeholder text. Flag these as review items instead.
- Appendix B and Appendix C: include only if there is meaningful content to put there. Otherwise omit them.

DELIVERY PLAN:
- Use a single phase if that is the most appropriate approach for the project's complexity and scope.
- Use multiple phases only when there is a clear reason: staged rollout, meaningful scope/dependency differences, or distinct user-value milestones.
- Name phases based on what makes sense for this specific project (e.g., "Beta", "v1.0", "Phase 1", "Full Launch") — do not default to "MVP / MVP+1 / MVP+2" unless that framing genuinely fits.
- If phasing is unclear from the context, write a single-phase plan and flag it as a review item.

REQUIREMENTS:
- Appendix A requirements: use SHALL/SHOULD/MAY keywords in ALL CAPS. Each requirement must be from the customer/stakeholder perspective and must NOT dictate implementation unless explicitly required by the customer.
- Requirement IDs must follow the pattern PRD-NNN (PRD-001, PRD-002, etc.).

FORMAT:
- Do not add extra sections beyond those in the template.
- Do not include meta-commentary, preamble, or closing remarks — output only the PRD markdown.`,
      messages: [
        {
          role: 'user',
          content: `Project README:\n${readme || '(none)'}\n\nContext files:\n${contextBlock}\n\nGenerate the complete PRD now. Today's date is ${today}.`,
        },
      ],
    },
    { signal }
  )

  let result = ''
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      result += event.delta.text
    }
  }
  return result
}

// Identify open questions, gaps, and decisions after a PRD is generated
export async function generatePrdReviewItems({ prdContent, signal }) {
  const client = createClient()

  const message = await client.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: `You are a senior PM reviewing a newly generated PRD. Identify open items that the author needs to address or consider before the PRD is ready for stakeholder review.

Return ONLY a valid JSON array (no markdown, no explanation) in this format:
[{ "id": "r1", "type": "question|gap|decision", "title": "Short title (max 10 words)", "detail": "1-2 sentence explanation of what needs to be addressed and why it matters" }]

Focus on:
- [TBD] placeholders that need to be filled in
- Assumptions that are stated but not validated
- Key decisions that are not yet made
- Missing alignment items (stakeholders, dependencies, dates)
- Requirements that are vague or untestable
- Optional supporting materials that were omitted but would meaningfully strengthen the PRD (e.g. wireframes, architecture diagrams). For these, frame the detail as an invitation: explain what value the material would add and how the author can provide it. Do NOT treat these as blocking issues — they are suggestions.

Do NOT flag style issues, grammar, or formatting. Limit to 8 items maximum — prioritize the most important ones. Return [] if the PRD is complete and ready for review.`,
      messages: [
        { role: 'user', content: `Review this PRD and return the JSON array of open items:\n\n${prdContent}` },
      ],
    },
    { signal }
  )

  const text = message.content[0].text.trim()
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    console.error('Failed to parse PRD review items:', text)
    return []
  }
}

// Revise a PRD based on user feedback on a specific review item
export async function revisePrdFromFeedback({ prdContent, reviewItem, feedback, signal }) {
  const client = createClient()

  const stream = await client.messages.stream(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: `You are an expert product manager revising a PRD based on specific feedback. Apply the feedback precisely and return the complete updated PRD markdown. Do not add commentary, preamble, or closing remarks — output only the revised PRD.`,
      messages: [
        {
          role: 'user',
          content: `PRD to revise:\n\n${prdContent}\n\n---\n\nReview item being addressed:\nType: ${reviewItem.type}\nTitle: ${reviewItem.title}\nDetail: ${reviewItem.detail}\n\nUser feedback:\n${feedback}\n\nApply this feedback to the PRD and return the complete revised document.`,
        },
      ],
    },
    { signal }
  )

  let result = ''
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      result += event.delta.text
    }
  }
  return result
}

// Increment the revision number in a PRD and add a change summary row
export async function incrementPrdRevision({ contentBefore, contentAfter, signal }) {
  const client = createClient()

  const today = new Date().toISOString().slice(0, 10)

  const message = await client.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: `You are a technical writer updating the Revision History section of a PRD. Given the before and after versions of a PRD, determine the next revision number, write a brief change summary (1 sentence, max 15 words), and return the complete updated PRD markdown with the new revision row added to the Revision History table and the "Current Revision" and "Last Updated" fields updated. Do not change any other content. Output only the updated PRD markdown with no preamble or commentary.`,
      messages: [
        {
          role: 'user',
          content: `Today's date: ${today}\n\nPRD BEFORE edits:\n${contentBefore}\n\n---\n\nPRD AFTER edits:\n${contentAfter}\n\nReturn the complete updated PRD with the new revision row added.`,
        },
      ],
    },
    { signal }
  )

  return message.content[0].text.trim()
}

// Generate Epics from PRD and project context
export async function generateEpics({ readme, contextFiles, prfaqContent, prdContent, template, signal }) {
  const client = createClient()

  const contextBlock = contextFiles.length
    ? contextFiles.map((f) => `### ${f.filename}\n${f.content}`).join('\n\n')
    : '(No context files provided)'

  const stream = await client.messages.stream(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: `You are an expert product manager generating an Epics document. Follow the template and rules below exactly.

TEMPLATE:
${template}

${prdContent ? `PRD (HIGHEST PRIORITY — primary source of truth for requirements, scope, and traceability):
${prdContent}

` : ''}${prfaqContent ? `PRFAQ (SECONDARY CONTEXT — product vision, customer framing):
${prfaqContent}

` : ''}RULES:
SCOPE:
- Generate epics that provide full coverage of all requirements in the PRD. Do not miss any PRD-NNN requirement IDs.
- Do not over-invent epics. A simple project may need only one or two epics. Only create epics for features that are actually in scope.
- Each epic must be a fully deliverable, user-testable unit of work — not a category or theme.

ORDERING:
- List epics in recommended implementation order: highest priority and lowest dependency risk first.
- Dependencies between epics must be reflected in the ordering.

PLANNED SCOPE:
- Use short, readable feature labels (e.g., "Login and Registration", "Dashboard Overview").
- Do NOT use "As a user…" format.
- Group related capabilities into one label. The list is non-exhaustive — enough to convey scope at a glance.

PRD REFERENCES:
- Include PRD-NNN requirement IDs in each epic's PRD References field when a PRD exists.
- Every PRD requirement should be traceable to at least one epic.

OPEN QUESTIONS:
- Use [TBD] prefix for each open question.
- Omit the Open Questions section entirely for an epic if there are none.

FORMAT:
- Output only the Epics markdown. No preamble, no commentary.
- The top of the document must include an anchor-linked list of all epics.`,
      messages: [
        {
          role: 'user',
          content: `Project README:\n${readme || '(none)'}\n\nContext files:\n${contextBlock}\n\nGenerate the complete Epics document now.`,
        },
      ],
    },
    { signal }
  )

  let result = ''
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      result += event.delta.text
    }
  }
  return result
}

// Identify open questions, gaps, and coverage issues after Epics are generated
export async function generateEpicsReviewItems({ epicsContent, prdContent, signal }) {
  const client = createClient()

  const message = await client.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: `You are a senior PM reviewing a newly generated Epics document. Identify open items the author should address before the epics are handed to engineering.

Return ONLY a valid JSON array (no markdown, no explanation) in this format:
[{ "id": "r1", "type": "question|gap|decision", "title": "Short title (max 10 words)", "detail": "1-2 sentence explanation of what needs to be addressed and why it matters" }]

Focus on:
- PRD requirements that are not covered by any epic (coverage gaps)
- [TBD] placeholders that need resolution before implementation begins
- Ordering or dependency assumptions that may not be correct
- Epics that seem too broad or too narrow to be deliverable as a unit
- Missing dependencies that could block implementation

Do NOT flag style, grammar, or formatting. Limit to 8 items maximum. Return [] if the epics are complete and well-structured.`,
      messages: [
        {
          role: 'user',
          content: `${prdContent ? `PRD (source of truth for requirements):\n${prdContent}\n\n---\n\n` : ''}Epics to review:\n\n${epicsContent}`,
        },
      ],
    },
    { signal }
  )

  const text = message.content[0].text.trim()
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    console.error('Failed to parse Epics review items:', text)
    return []
  }
}

// Revise Epics based on user feedback on a specific review item
export async function reviseEpicsFromFeedback({ epicsContent, reviewItem, feedback, signal }) {
  const client = createClient()

  const stream = await client.messages.stream(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: `You are an expert product manager revising an Epics document based on specific feedback. Apply the feedback precisely and return the complete updated Epics markdown. Do not add commentary, preamble, or closing remarks — output only the revised Epics document.`,
      messages: [
        {
          role: 'user',
          content: `Epics to revise:\n\n${epicsContent}\n\n---\n\nReview item being addressed:\nType: ${reviewItem.type}\nTitle: ${reviewItem.title}\nDetail: ${reviewItem.detail}\n\nUser feedback:\n${feedback}\n\nApply this feedback to the Epics document and return the complete revised document.`,
        },
      ],
    },
    { signal }
  )

  let result = ''
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      result += event.delta.text
    }
  }
  return result
}

// Phase 2: generate the full PRFAQ
export async function generatePrfaq({ readme, contextFiles, answers, template, signal }) {
  const client = createClient()

  const contextBlock = contextFiles.length
    ? contextFiles.map((f) => `### ${f.filename}\n${f.content}`).join('\n\n')
    : '(No context files provided)'

  const answersBlock = Object.entries(answers).length
    ? Object.entries(answers)
        .map(([field, value]) => `${field}: ${value}`)
        .join('\n')
    : '(No additional info provided — use placeholders where needed)'

  const stream = await client.messages.stream(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: `You are an expert product strategist generating a PRFAQ using Amazon's working-backwards methodology. Follow the template and rules below with strict discipline.

TEMPLATE:
${template}

RULES:
- Title: # Product Name
- Heading: one sentence, target customer self-identifies immediately
- Subheading: one sentence, specific customer segment + primary benefit — never "for everyone"
- Summary paragraph: opens with **City, State (Media Outlet) — Month DD, YYYY** — then 2-3 sentence hook
- Problem paragraph: EXACTLY one paragraph, customer POV only, no solution reference
- Solution paragraph: EXACTLY one paragraph, includes competitive framing: "Today, customers use [x]. Those fall short because [y]. [Product] addresses this by [z]."
- Quotes & Getting Started: spokesperson quote and hypothetical customer voice woven into narrative prose, ends with call to action + URL
- NO internal section headers or horizontal rules within the press release — it reads as a single narrative
- External FAQ: customer/press questions only, no internal metrics or technical details, **Q:** / A: format
- Internal FAQ: stakeholder questions including technical/business/strategic, same format
- Both FAQ sections end with an italicized note to add new questions over time
- Use [placeholder] for any information still unknown after the provided answers
- Do not invent financial projections, headcount, or strategic decisions`,
      messages: [
        {
          role: 'user',
          content: `Project README:\n${readme || '(none)'}\n\nContext files:\n${contextBlock}\n\nAnswers to unknowns:\n${answersBlock}\n\nGenerate the complete PRFAQ now.`,
        },
      ],
    },
    { signal }
  )

  let result = ''
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      result += event.delta.text
    }
  }
  return result
}
