# /generate-epics

Generate an Epics document for a spekt. project.

## Usage

```
/generate-epics [project-slug]
```

If `project-slug` is omitted, look for the project in the current working directory or ask the user which project to use.

## Steps

1. Locate the project root: `projects/{slug}/`
2. Load the epics template from `src/templates/epics.template.md`
3. Invoke the `generate-epics` skill

The skill will read your README, PRD (primary source of truth), PRFAQ, and context files, generate the complete Epics document, identify any review items, and offer to save the result to `projects/{slug}/{slug}-epics.md`.
