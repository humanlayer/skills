# Create Research Questions

Turn the user's task into focused questions about how the current system works. These questions give the next research session its scope and starting points.

## Read the Request

Read the files and sources the user names in full. Preserve exact paths, package names, repository names, and URLs as context pointers for the research agent.

Use the task directory and chosen flow established by `/rpi`.

## Check Enough Context to Ask Good Questions

Do lightweight research to locate the relevant code and understand the request. Use subagents where useful:

- `codebase-locator` finds related source files, configuration, and tests.
- `codebase-analyzer` explains current behavior and interactions with file and line references.
- `codebase-pattern-finder` finds related implementations and conventions.
- `web-search-researcher` checks external web sources and library documentation when needed.

If an Explore agent/tool is available, you can use that too.

Keep this pass small; the next research session does the full investigation.

## Write Current-State Questions

Ask what exists, where it lives, and how it works today. Cover the relevant behavior, data flow, tests, constraints, edge cases, and library capabilities. Frame each question as a descriptive question about the existing system, keeping future design choices for the design phase.

Use concrete starting points: "In `packages/ui`, how does the theme reach shared components?" or "How does the worker recover queued jobs after a restart?"

Usually write two to seven questions, with more when the task warrants it. Match the scope and depth to the task.

For frontend work, include the existing design system: components, colors and hex codes, typography, spacing, borders, shadows, and theming. This gives later mockups the project's visual conventions.

## Save the Questions

Write `NN-research-questions-<description>.md` in the selected task directory, using the next available number and a short kebab-case description. Use this shape:

```markdown
---
type: research-questions
flow: <design-discussion | prd | tdd | research-only>
---

# Research Questions: <Topic>

## Key Context Pointers

- <Exact path, package name, repository, or URL>

## Questions

1. <Current-state question with relevant starting points>
2. <Current-state question with relevant starting points>
```

Include context pointers when the request supplies them. Keep the questions self-contained so the research session can use this document as its task context. Do not include context about the task the user shared with you in the document, so a research agent can remain objective in its search.

## Hand Off to Research

Read `$SKILLBASE/references/create-research-questions/references/research_questions_final_answer.md` and respond using that template, filling in the saved file path, task directory, and chosen flow.
