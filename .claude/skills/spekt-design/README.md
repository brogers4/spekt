# spekt. — Design System

> A calm, dark-first interface system for product owners who want AI to do the boring parts of their job without learning CLIs, prompts, or "agentic patterns."

## What is spekt.?

spekt. is an **open-source** productivity tool for **medium-tech-savvy Product Owners**. The core loop is:

1. **Drop in raw context** — meeting transcripts, scratch notes, half-finished thoughts, customer quotes, linked docs. No structure required.
2. **The agent reads it all** and generates a **linked artifact tree**:
   - **PR/FAQ** (the working-backwards press release)
   - **PRD** (problem, success metrics, scope, acceptance criteria)
   - **Epics** (broken down from the PRD, linked back to problem statements)
   - **User stories** (given / when / then, grouped under epics)
3. **Optionally**, the agent also generates supporting diagrams:
   - **Flow chart** — user steps with branches
   - **Sequence diagram** — system-level call flow
   - **User journey** — stages, touchpoints, emotional arc

The product personality sits at the intersection of two ideas:

- **Approachable, not intimidating.** Users are smart but not engineers. They don't want to think about agents, skills, or models. They want predictable outputs from a tool that feels considered.
- **Modern, not flashy.** Dark theme, soft contrast, subtle gradients and shadows. Spacious layouts. Playful but understated color. Quietly confident.

## Sources used

This design system was built **from scratch** for a greenfield, open-source product. No existing codebase, Figma file, or brand guideline was provided.

> If you have existing brand assets — logo files, a Figma library, a codebase, or even mood-board screenshots — please reattach them via the Import menu and I'll align the system to them.

## Index

| File | What's in it |
| --- | --- |
| `README.md` | This file — brand context, content + visual foundations, iconography |
| `colors_and_type.css` | Token layer — every color, type ramp, spacing, radius and shadow as a CSS var |
| `SKILL.md` | Cross-compatible Agent Skill manifest for using this system in Claude Code |
| `fonts/` | Font references (Google Fonts links; no local files yet) |
| `assets/` | Logos, brand mark, generic illustrations |
| `preview/` | Small HTML cards that render in the Design System tab |
| `ui_kits/web_app/` | High-fidelity React recreation of the spekt. web app |

---

(See VISUAL FOUNDATIONS, CONTENT FUNDAMENTALS, and ICONOGRAPHY sections below.)

---

## VISUAL FOUNDATIONS

### The vibe in one paragraph
A soft, dark-first canvas. Surfaces feel like layered paper in a dim room — never pitch black, never flat gray. Color appears sparingly: a warm coral as the primary "agent" accent, a cool sage as the supporting voice. Type is generous and unhurried. Edges are quietly rounded. Motion is gentle — things ease, never bounce. Nothing demands your attention except the thing that actually matters.

### Color
- **Canvas (`--bg-canvas`, `#0F1216`)** — deep, slightly cool, never #000. Sits below all surfaces.
- **Surfaces** step up in 4 levels (`--bg-1` → `--bg-4`). Each step is ~2 L\* lighter; the contrast is *just barely* perceptible, which is the point.
- **Primary accent — Coral (`--accent-coral`, `#E8927C`)** is the AI / action color. Used on the agent's voice, the primary CTA, focus rings, generation progress.
- **Secondary — Sage (`--accent-sage`, `#8FB9A8`)** signals confirmed, settled, or successful state. Used on saved/approved artifacts.
- **Semantic** colors (success, warn, danger, info) are *desaturated* versions of their conventional hues — closer to dried fruit than to a stoplight.
- Never use pure white text. `--fg-1` is `#ECEEF2`. Always.

### Typography
- **Display:** `Bricolage Grotesque` — rounded, slightly humanist grotesque. Carries the "approachable" half of the brand. Used 600/700 for H1–H3.
- **Body:** `Geist` — Vercel's neutral sans. Quiet, modern, very legible at 14–16px. Used 400/500.
- **Mono:** `Geist Mono` — for IDs, code, file paths, JSON in artifact previews.

The type scale is **modest** — even H1 maxes out at 40px in product UI. Everything wants room to breathe more than it wants to be loud.

### Spacing
A 4px base grid. Layouts are generous: minimum gutter is 24px, content max-width 720px for readable artifact text, 1080px for app frames. Padding inside cards starts at 20px, never less than 16px.

### Backgrounds
- **No full-bleed photography.** No stock imagery.
- The canvas is occasionally accented with a single **soft radial gradient** (coral or sage, 4–6% opacity) anchored to the top-left or trailing the cursor on hero areas.
- No repeating patterns or textures. The product is a paper-on-paper feel — emptiness *is* the texture.

### Animation & motion
- Default easing: `cubic-bezier(0.32, 0.72, 0, 1)` — a smooth, slightly inertial ease-out. Used everywhere.
- Default duration: **180ms** for hover/state, **260ms** for panel open/close, **400ms** for page transitions.
- **No bounces. No springs. No big scale-pops.** Things fade and slide a few pixels.
- The agent's "thinking" state is the only exception: a slow, breathing coral pulse on the avatar dot (1600ms, ease-in-out, infinite).

### Hover & press states
- **Hover (non-button surfaces):** `background-color` lifts by one surface step. No transform.
- **Hover (buttons):** `background-color` darkens 6%, no scale.
- **Press:** `background-color` darkens 12%, plus a `scale(0.985)` for buttons only.
- **Focus:** 2px outline in `--accent-coral` at 60% opacity, with a 3px offset on light surfaces and a 2px offset on dark.

### Borders & dividers
- Default border: `1px solid var(--border-1)` (`#22272F`).
- Strong border (focus, selected): `1px solid var(--border-2)` (`#2F3640`).
- Dividers between list items inside a card use `--border-1`. Outside cards (between sections), dividers are replaced by **whitespace**, not lines.

### Shadows & elevation
On dark UI, dark drop shadows have nothing to land on, so spekt. elevation is carried primarily by a **light rim** — a 1px outer ring plus a 1px inset highlight at the top edge, both in rgba-white. The rim brightens as elevation rises; a soft dark drop layers underneath as a secondary cue.
- `--shadow-1` resting card: rim 4% / inset 5% / drop `0 1px 2px rgba(0,0,0,0.30)`
- `--shadow-2` raised: rim 7% / inset 8% / drop `0 6px 16px -4px rgba(0,0,0,0.50)`
- `--shadow-3` popover: rim 10% / inset 11% / drop `0 16px 32px -8px rgba(0,0,0,0.55)`
- `--shadow-4` modal: rim 13% / inset 14% / drop `0 32px 64px -16px rgba(0,0,0,0.65)`

Together the ring + the top-edge highlight read as "light from above is catching the top edge of a slightly raised surface" — quiet, but legible against the canvas. If you port the system to a light theme, replace the white rim values with low-opacity black at roughly half the intensity.

### Protection gradients
When text overlaps imagery or a colored block, we **never use a hard scrim**. Always a vertical `linear-gradient(180deg, transparent, var(--bg-canvas) 80%)` — soft, long, invisible at the edges.

### Capsules vs pills
- **Capsule** (full pill, `border-radius: 999px`) — used for status chips, filter chips, the "active model" indicator.
- **Tag** (small rounded rect, `border-radius: 6px`) — used for artifact-type labels (PRD, Story, etc.).

### Corner radii
- `--radius-xs: 4px` (chips, inline pills)
- `--radius-sm: 6px` (tags, small buttons)
- `--radius-md: 10px` (buttons, inputs)
- `--radius-lg: 14px` (cards)
- `--radius-xl: 20px` (modals, large panels)
- `--radius-full: 999px` (avatars, capsules)

### Cards
- `background: var(--bg-2)`
- `border: 1px solid var(--border-1)`
- `border-radius: var(--radius-lg)` (14px)
- `box-shadow: var(--shadow-1)`
- Padding: 20px on small, 24–28px on standard, 32px on hero
- **No** hover lift on cards by default. If interactive, swap to `--bg-3` background on hover.

### Transparency & blur
Used **sparingly**. Only two places:
1. The top app bar: `backdrop-filter: blur(20px); background: rgba(15, 18, 22, 0.72);` when the page is scrolled.
2. Modal overlays: `background: rgba(8, 10, 13, 0.55); backdrop-filter: blur(8px);`

No frosted-glass cards. No semi-transparent panels in normal layout.

### Imagery feel
We don't ship product photography. If illustrations appear (rare), they are:
- Line-only (1.25px stroke)
- Single color (`--fg-3`)
- Geometric, slightly imperfect

No grain. No 3D renders. No gradients-on-photos.

### Layout rules
- Sidebar nav: **240px fixed**, always visible on desktop, collapsible to 64px (icon-only).
- Top bar: **56px fixed**, sticky.
- Right inspector panel (when present): **320–400px**, collapsible.
- Content area max-width for prose/artifacts: **720px**. For dashboards / lists: **1200px**.
- All page padding starts at **32px**; on mobile it drops to 20px and the sidebar becomes a drawer.

---

## CONTENT FUNDAMENTALS

### Voice
The product talks like a **competent, calm colleague who's been doing this for a while**. Not chirpy. Not corporate. Not "wow"-y. Closer to a senior PM giving you a quick handoff than to a chatbot.

### Tone shifts
- **Empty states & onboarding:** warm, encouraging, lightly playful. "Let's get your first PRD out the door."
- **In-flow microcopy:** dry and direct. "Drafting acceptance criteria…"
- **Confirmations:** quiet. "Saved." / "Published to Jira."
- **Errors:** human, never blamey. Never "Oops!" or "Uh oh!" Always "Something didn't go through — let's try again."

### Casing
- **Sentence case everywhere.** Buttons, menu items, headers, modal titles. "New artifact", not "New Artifact".
- Product name is **spekt.** (lowercase "spekt" with coral period). The artifact type names (PRD, BRD, RFC) stay in caps.
- Acronyms inside body text are in caps without periods: "PRD", not "P.R.D."

### Person
- **"You"** for the user. Always.
- The AI/agent refers to itself as **"I"** in conversational moments and **"the agent"** in system-level descriptions ("the agent will draft acceptance criteria").
- Never "we" unless it genuinely refers to the company.

### Emoji
**No emoji in UI chrome.** Not in buttons, headers, empty states, navigation, or notifications. The brand is too calm for it.
- One exception: users can include emoji in their own input / artifact body. The product renders them; it doesn't suggest them.

### Microcopy examples
| Surface | What we say | What we don't say |
| --- | --- | --- |
| Primary CTA | "Generate draft" | "✨ Generate with AI!" |
| Empty state | "Nothing here yet. Drop in a brief or start from a template." | "Looks empty in here! 🌵" |
| Loading | "Drafting…" | "Hang tight, the AI is working its magic!" |
| Success toast | "Saved to your workspace." | "🎉 Awesome — saved!" |
| Error | "We couldn't reach Jira. Check your connection in Settings." | "Oops! Something went wrong. Please try again." |
| Confirmation | "Discard draft? You can't undo this." | "Are you sure you want to delete?" |

### Numbers, dates, lists
- Dates: `Mar 14, 2026` in UI; `2026-03-14` only in machine contexts.
- Numbers under ten are spelled out in prose: "three artifacts", but UI counters always use digits ("3").
- Bulleted lists prefer **no terminal periods** for fragment items.

---

## ICONOGRAPHY

### System
**Lucide** (CDN, `lucide@latest` ESM) is the canonical icon set for spekt.

> **Flag — substitution.** Since no proprietary icon set was provided with this brief, Lucide was chosen as the closest match to the brand: 1.5px stroke, rounded line caps, 24×24 grid, slightly humanist geometry — it harmonizes with Bricolage Grotesque's rounded terminals. Swap any icon by name; if you later supply a custom set, replace `assets/icons/` and the `<Icon>` component points at it.

### Rules
- **Size:** 16px (inline with body text), 18px (default in buttons & nav), 20px (large), 24px (only in empty states / illustrative use).
- **Stroke width:** Lucide default (1.5). Never bold (2.5) — that visually clashes with the soft palette.
- **Color:** icons inherit text color via `currentColor`. They are **never** standalone primary-colored unless they ARE the brand mark.
- **Padding:** Icon-only buttons are minimum 36×36px tap target. The icon itself is 18px, the surrounding 9px is breathing room.
- **Alignment:** Inline icons sit on the baseline. `vertical-align: -0.125em` is the default class.

### Logo & mark
The spekt. mark is a custom hand-built SVG (the *only* hand-built SVG in the system), found at:
- `assets/logo-mark.svg` — the square mark, 32×32 viewBox
- `assets/logo-wordmark.svg` — mark + "spekt." wordmark
- `assets/logo-mark-light.svg` — light-on-dark version
- `assets/logo-mark-dark.svg` — dark-on-light version (for export)

The mark represents a **stacked artifact** (the document) with a single dot — the agent. It's a quiet pictograph, not a sparkle or a robot.

### Emoji
Not used in product chrome. Renderable in user-authored content only.

### Unicode glyphs
A handful of typographic glyphs are used in UI text and should not be replaced with images:
- `→` (U+2192) for "next / continue" inline
- `↵` (U+21B5) on keyboard hint chips
- `·` (U+00B7) as a separator in metadata (`PRD · 2 min read · Updated 14m ago`)
- `…` (U+2026) for truncation; never three periods.

### Use of imagery
Stock imagery is **not used**. If a hero needs visual weight, prefer a single oversized glyph, a soft radial gradient, or a Bricolage-display headline at extreme size.
