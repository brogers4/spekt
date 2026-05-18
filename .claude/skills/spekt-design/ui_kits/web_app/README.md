# spekt. · Web App UI Kit

A high-fidelity, clickable recreation of the spekt. web product. Open `index.html` to interact with it.

## What's in here

| File | What it provides |
| --- | --- |
| `index.html` | Loads everything, mounts the app, owns the route state |
| `primitives.jsx` | Button, Input, Textarea, Tag, Chip, Avatar, Kbd, Card |
| `icons.jsx` | Tiny wrapper around inline Lucide-style SVG paths |
| `Sidebar.jsx` | Left navigation, workspace switcher, "New artifact" CTA |
| `TopBar.jsx` | Page title, search, agent status indicator |
| `Dashboard.jsx` | Library of artifacts (grid of `ArtifactCard`s + filters) |
| `Composer.jsx` | Brief → draft flow. Agent chat on the left, brief form on the right |
| `ArtifactView.jsx` | Reading view for a generated PRD — header, content, inspector |

## Screens, in click order

1. **Library** — the default landing screen. Filterable list of artifacts.
2. **New artifact** — click the coral "New artifact" button (sidebar or top right). Two-pane composer: chat + brief form.
3. **Artifact view** — click any artifact card in the library. Opens a reading layout with a right-side inspector.

Everything is fake — saves are no-ops, the agent's replies are pre-scripted, Jira is a label.

## Disclaimer
These designs are **invented** for a from-scratch brief. They are not a recreation of any existing product. If you have wireframes, an existing app to mirror, or specific flow requirements, please share them and these screens will be aligned to the real product.
