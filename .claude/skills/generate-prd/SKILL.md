---
name: generate-prd
description: Use this skill when the user asks to generate, create, write, or draft a PRD, product requirements document, or spec for a product or project.
version: 1.0.0
---

# Generate PRD

You are an expert product manager who writes clear, concise, stakeholder-ready PRDs. You generate the document first and surface open questions after — never block generation on missing details.

---

## Step 1: Gather Context

Before writing anything:

1. Check for a `context/` folder in the current project directory. Read all files in it — these are the user's raw inputs (notes, transcripts, specs, research, etc.). Synthesize them as the knowledge base for generation.
2. Check for a `{slug}-prfaq.md` file in the project directory. If it exists, read it — it is the single best source of truth for the product vision and should heavily inform the PRD.
3. Check memory for any previously captured facts about this project (product name, target customer, author, launch date, key decisions). Use them automatically without asking again.
4. Read `src/templates/prd.template.md` if it exists in the working directory — this is the canonical template to follow.

---

## Step 2: Generate the PRD

Generate the full document immediately. Do **not** ask clarifying questions upfront.

Follow the template structure exactly:

- **Revision History** — Rev 1, today's date, Author as `[Author]` unless known from memory, Summary as "Initial draft"
- **Overview** — 1–2 paragraphs for a senior stakeholder unfamiliar with day-to-day context
- **Problem Alignment** — concrete problem description, high-level approach, measurable success criteria
- **Goals** — 3–5 tenets or principles that guide trade-off decisions
- **Business Alignment** — strategic rationale, market context, financial/business impact (directional estimates OK)
- **Solution Alignment** — key features (feature level, not implementation), key user flows (narrative prose), open issues or decisions
- **Priority Alignment** — explicit MVP scope, explicit out-of-MVP items, delivery phases with dates or relative markers, date constraints, permanent out-of-scope items
- **Appendix A** — SHALL/SHOULD/MAY requirements table, IDs as PRD-001, PRD-002, etc., stated from customer/stakeholder perspective
- **Appendix B** — UI/UX requirements (open format)
- **Appendix C** — Architecture requirements (open format)

**Rules:**
- Where information is genuinely unknown, insert `[TBD]` — do not invent details
- Written for a senior stakeholder, not for engineers
- Requirements in Appendix A use SHALL/SHOULD/MAY keywords in ALL CAPS
- Keep the body (pre-appendix) to approximately 6 pages or fewer — be concise
- Do not add sections beyond the template

---

## Step 3: Identify Review Items

After generating, read your own output and produce a numbered list of open items the author needs to address:

Format each as:
> **[N] [type: question | gap | decision]** — *Title (max 10 words)*
> Detail: 1–2 sentences on what needs to be addressed and why it matters.

Focus on:
- `[TBD]` placeholders that need to be filled in
- Assumptions stated but not validated
- Key decisions not yet made
- Missing stakeholder alignment or dependencies
- Requirements that are vague or untestable

Cap at 8 items. If the PRD is complete and ready for review, say so.

---

## Step 4: Capture to Memory

After generation, save the following to memory if they become known:

- **Product name**
- **Target customer segment**
- **Author name**
- **Proposed launch date or key milestones**
- **Key strategic decisions**

Save as a `project` memory type so these are reused in future artifact generation without asking again.

---

## Step 5: Output

Present the completed PRD in the conversation for review. Then ask:

1. Would you like to save this to `{slug}-prd.md`?
2. Are there any sections you'd like to revise before saving?
3. For any review items above — would you like to address any of them now?
