---
name: spekt-design
description: Use this skill to generate well-branded interfaces and assets for spekt., either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files:

- `colors_and_type.css` — the token layer. Import this at the top of any HTML/CSS artifact and you get the full color, type, spacing, radius, shadow and motion system as CSS variables.
- `assets/` — the logo (mark, wordmark, light/dark mono variants).
- `preview/` — example HTML snippets demonstrating type, colors, spacing, components, and brand voice. Read these to understand how the tokens compose.
- `ui_kits/web_app/` — a complete clickable React recreation of the spekt. product. `primitives.jsx` has Button / Input / Tag / Chip / Avatar / Card and friends; `Sidebar.jsx`, `TopBar.jsx`, `Dashboard.jsx`, `Composer.jsx`, `ArtifactView.jsx` are the screens. Copy components out — don't reference back into the skill.
- `fonts/` — points at Google Fonts (Bricolage Grotesque + Geist + Geist Mono). No local font files yet.

### When making a visual artifact (slides, mocks, throwaway prototypes)

1. Copy `colors_and_type.css` and the relevant `assets/` files into the artifact's folder.
2. Import the CSS in the artifact: `<link rel="stylesheet" href="colors_and_type.css" />`.
3. Read the README's **VISUAL FOUNDATIONS** and **CONTENT FUNDAMENTALS** sections before writing copy or laying anything out — the voice and motion rules are opinionated.
4. Use Lucide icons via CDN (`https://unpkg.com/lucide@latest`) at 1.5 stroke, currentColor.

### When making production code

You can read the rules in `README.md` and replicate the tokens in your real design-token pipeline. The `primitives.jsx` components are intentionally cosmetic — re-implement them in your real framework, but match the styling exactly.

### When invoked with no other guidance

Ask the user what they want to build or design, ask a few questions (output format, audience, screen vs. slide, light vs. dark — though spekt. is dark-first), then act as an expert designer who outputs HTML artifacts *or* production code depending on the need.

### Non-negotiables

- **Dark by default.** Never pure black background. Never pure white text.
- **Sentence case.** Buttons, headings, modal titles. Acronyms stay capped (PRD, BRD, RFC).
- **No emoji in product chrome.** User-authored content can render them; the product never suggests them.
- **No bouncy motion.** Default easing is `cubic-bezier(0.32, 0.72, 0, 1)`, durations 120–260ms.
- **Coral is the AI / action color.** Don't apply it to passive elements.
- **The agent talks like a calm senior PM.** Not chirpy, not corporate. See README CONTENT FUNDAMENTALS § "Microcopy examples".
