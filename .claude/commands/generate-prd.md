---
description: Generate a PRD for a project using the template and context files
argument-hint: [project-name]
---

# Generate PRD

$ARGUMENTS

**Locate the project root and template:**

1. If `projects/$ARGUMENTS` exists as a directory, use it as the project root and load the template from `src/templates/prd.template.md` (you are running from the spekt root).
2. Otherwise, use `.` as the project root and load the template from `../../src/templates/prd.template.md` (you are already inside the project folder).

The project slug is `$ARGUMENTS` (or the folder name when running from inside the project).

Follow the full generate-prd skill instructions:

1. **Gather context** — Read `README.md` and all files in `context/` within the project root. Check for an existing `{slug}-prfaq.md` — if present, read it as the primary source of truth for product vision. Load the PRD template from the path determined above. Check memory for previously captured project facts.

2. **Generate the PRD immediately** — do not ask clarifying questions upfront. Where information is genuinely unknown, insert `[TBD]`. Follow the template structure exactly:
   - Revision History (Rev 1, today's date, Author from memory or `[Author]`)
   - Overview, Problem Alignment, Goals, Business Alignment
   - Solution Alignment, Priority Alignment
   - Appendix A (SHALL/SHOULD/MAY requirements, IDs as PRD-001+)
   - Appendix B (UI/UX), Appendix C (Architecture)

3. **After generating**, review your output and present a numbered list of open items (type: question | gap | decision) that the author needs to address. Cap at 8 items.

4. **Save to memory** any facts that became known: product name, target customer, author, launch date, key decisions.

5. **After presenting the output**, ask if the user wants to save it to `{slug}-prd.md` (e.g. `my-project-prd.md`), offer to address any review items, and ask if any sections need revision before saving.
