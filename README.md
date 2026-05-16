# PO Agent

> A local-first artifact generator for product owners — turn context into PRDs, PRFAQs, Epics, User Stories, and Backlogs, all stored as editable markdown files on your machine.

## Overview

PO Agent is a browser-based dashboard that helps product owners generate and manage the full suite of product artifacts. Everything is stored locally as plain markdown files using the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) — no backend, no cloud sync, no accounts.

**Key features:**
- Create and manage multiple projects, each backed by a folder on your machine
- Add context to each project — meeting notes, transcripts, feature ideas, PDFs, images — via a built-in markdown editor or drag-and-drop upload
- Generate artifacts (PRD, PRFAQ, Epics, User Stories, Backlog) from your context using Claude AI *(coming soon)*
- All files are plain markdown, fully editable in VS Code, iA Writer, or any text editor

> **Browser requirement:** Chrome or Edge only. The File System Access API is not supported in Firefox or Safari.

## Getting started

```bash
# Clone the repo
git clone https://github.com/brogers4/po-agent.git
cd po-agent

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in Chrome or Edge.

On first launch, click **Choose Folder** to pick a workspace directory. PO Agent will store all project files there as editable markdown.

## Project structure

```
<workspace>/
  <project-slug>/
    README.md          ← project name, description, created date
    context/           ← notes and reference files you provide
      meeting-notes.md
      spec.pdf
      wireframe.png
    prd.md             ← generated artifacts (coming soon)
    prfaq.md
    epics.md
    user-stories.md
    backlog.md
```

## Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Vite](https://vitejs.dev) | 6 | Build tool and dev server |
| [React](https://react.dev) | 19 | UI library |
| [React Router](https://reactrouter.com) | 7 | Client-side routing |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styling |
| [react-markdown](https://github.com/remarkjs/react-markdown) | — | Markdown rendering |
| [idb](https://github.com/jakearchibald/idb) | — | IndexedDB wrapper for persisting workspace handle |

## Development

```bash
npm run dev      # start dev server at localhost:5173
npm run build    # production build
npm run preview  # preview production build locally
```

## License

MIT
