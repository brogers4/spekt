![spekt.](src/assets/spekt-lockup.png)

> A local-first artifact generator for product owners — turn context into PRDs, PRFAQs, Epics, User Stories, and Backlogs, all stored as editable markdown files on your machine.

## Overview

spekt. is a browser-based dashboard that helps product owners generate and manage the full suite of product artifacts. Projects are stored inside the `spekt/projects/` directory as plain markdown files — no backend, no cloud sync, no accounts. A lightweight Node.js file API runs inside the Vite dev server to read and write files on your behalf.

**Key features:**
- Create and manage multiple projects, each stored under `projects/` in the app directory
- Add context to each project — meeting notes, transcripts, feature ideas, PDFs, images — via a built-in markdown editor or drag-and-drop upload
- Generate artifacts (PRFAQ, and more) from your context using the Claude API or Claude Code CLI
- All files are plain markdown, fully editable in VS Code, iA Writer, or any text editor

## Getting started

```bash
# Clone the repo
git clone https://github.com/brogers4/spekt.git
cd spekt

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in any modern browser. The `projects/` directory is created automatically on first launch.

Set your Claude API key in **Settings** to enable artifact generation, or use CLI mode to generate via [Claude Code](https://claude.ai/code).

## Project structure

```
spekt/
  projects/                         ← gitignored; all user data lives here
    <project-slug>/
      README.md                     ← project name, description, created date
      context/                      ← notes and reference files you provide
        meeting-notes.md
        spec.pdf
        wireframe.png
      <project-slug>-prfaq.md       ← generated artifacts
      <project-slug>-prd.md
```

## Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Vite](https://vitejs.dev) | 8 | Build tool and dev server (also hosts the file API) |
| [React](https://react.dev) | 19 | UI library |
| [React Router](https://reactrouter.com) | 7 | Client-side routing |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styling |
| [react-markdown](https://github.com/remarkjs/react-markdown) | — | Markdown rendering |
| [@anthropic-ai/sdk](https://github.com/anthropic/anthropic-sdk-node) | — | Claude API client |
| [busboy](https://github.com/mscdex/busboy) | — | Multipart file upload parsing in the dev server |
| [@fontsource-variable/bricolage-grotesque](https://fontsource.org) | — | Display font (self-hosted) |
| [@fontsource/geist](https://fontsource.org) | — | Body font (self-hosted) |
| [@fontsource/geist-mono](https://fontsource.org) | — | Mono font (self-hosted) |

## Development

```bash
npm run dev      # start dev server at localhost:5173
npm run build    # production build (static only — file API requires the dev server)
npm run preview  # preview production build locally
```

> **Note:** The `/api/*` file endpoints only exist in `vite dev`. The production build is a static bundle with no file API.

## License

MIT
