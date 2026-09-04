# skills

Claude Code skills from [HumanLayer](https://humanlayer.dev).

## Installation

```bash
npx skills add humanlayer/skills --skill SKILLNAME
```

## Available Skills

### improve-claude-md

Rewrites your CLAUDE.md using `<important if>` blocks to improve instruction adherence.

```bash
npx skills add humanlayer/skills --skill improve-claude-md
```

Then in your project:

```
/improve-claude-md
```

### narrow-react-prop-types

Narrows React component prop types to match live code paths instead of Storybook, test, or mock-only states.

```bash
npx skills add humanlayer/skills --skill narrow-react-prop-types
```

Then in your project:

```
/narrow-react-prop-types
```

### build-iterated-agentic-loop

Use this when the recurring task, scope, and validation are already understood. It builds a repo-local skill plus an iterated coding-agent GitHub Actions workflow, prompt, memory file, and reference templates.

```bash
npx skills add humanlayer/skills --skill build-iterated-agentic-loop
```

Then in your project:

```
/build-iterated-agentic-loop
```

### design-control-loop

Use this when you first need to work out what progress means and how each run should choose a safe increment. It interviews you to define a goal, checker, selector, and coding agent tailored to your codebase, then builds them as locally runnable components plus a scheduled workflow.

```bash
npx skills add humanlayer/skills --skill design-control-loop
```

Then in your project:

```
/design-control-loop
```

The two skills overlap at implementation time, but neither is a drop-in replacement for the other:

- Choose `build-iterated-agentic-loop` for the shorter path from an already-defined repeatable task to automation.
- Choose `design-control-loop` when the task still needs a measurable goal, a repeatable checker, or an explicit policy for selecting the next reviewable change. It adds that design work before building the automation.

### show-me

Explains the current topic with concise diagrams, code-shape sketches, and focused HTML artifacts.

```bash
npx skills add humanlayer/skills --skill show-me
```

Then invoke:

```
/show-me
```
