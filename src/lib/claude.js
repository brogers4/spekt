import Anthropic from '@anthropic-ai/sdk'

const KEY = 'po-agent:claude-api-key'
const KEY_PATTERN = /^sk-ant-/
const CLI_MODE_KEY = 'po-agent:cli-mode'

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
