---
description: Generate a PRFAQ for the current project using the working-backwards framework
argument-hint: [optional: brief product description or focus area]
---

# Generate PRFAQ

Generate a PRFAQ document for this project following the working-backwards methodology and PO Agent template rules.

$ARGUMENTS

Follow the full generate-prfaq skill instructions:

1. **Gather context** — Read all files in `context/`, check memory for previously captured project facts, and load `src/templates/prfaq.md` if present.

2. **Identify unknowns** — For anything that is genuinely unknown (company name, target customer, launch date, dateline, spokesperson, website URL, FAQ answers), do not invent or silently use a placeholder. Prompt the user with:
   > **[Unknown item]** — How would you like to handle this?
   > 1. **Provide it now**
   > 2. **Leave a placeholder**
   > 3. **Give me suggestions** (I'll offer 2–3 options)
   
   Batch multiple unknowns into a single prompt. Wait for answers before generating.

3. **Generate the PRFAQ** following these strict rules:

   **Press Release** (reads as a single narrative — no internal section headers or dividers):
   - `# Product Name` title
   - Heading: one sentence for the target customer to immediately self-identify
   - Subheading: one sentence naming the specific customer segment and primary benefit — never "for everyone"
   - Summary paragraph: dateline (`**City, State (Media Outlet) — Date** —`) + 2–3 sentence hook
   - Problem paragraph: exactly one paragraph, customer's POV only, no solution reference
   - Solution paragraph: exactly one paragraph, includes competitive framing ("Today, customers use [x]. Those fall short because [y]. [Product] addresses this by [z].")
   - Quotes & Getting Started: spokesperson quote and hypothetical customer voice woven into narrative prose, ends with call to action + URL

   **FAQ** (two labeled sections):
   - External FAQ: customer/press questions only, no internal metrics or technical details
   - Internal FAQ: stakeholder questions, may include technical, business, and strategic topics
   - Both sections use `**Q:**` / `A:` format and end with a note to add new questions over time

4. **Save to memory** any facts provided: company name, target customer segment, spokesperson, launch date, website URL, dateline city/outlet.

5. **After presenting the output**, ask if the user wants to save it to `prfaq.md`, request any revisions, and prompt for any new FAQ questions to add.
