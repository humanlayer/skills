---
name: improve-claude-md
description: improve a CLAUDE.md file using <important if> blocks to improve instruction adherence
disable-model-invocation: true
---

When the user provides a CLAUDE.md file (or asks you to improve one), rewrite it following the principles and structure below.

## Core Problem

Claude Code injects a system reminder with every CLAUDE.md that says:

> "this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task."

This means Claude will ignore parts of your CLAUDE.md it deems irrelevant. The more content that isn't applicable to the current task, the more likely Claude is to ignore everything — including the parts that matter.

## Solution: `<important if="condition">` Blocks

Wrap conditionally-relevant sections of the CLAUDE.md in `<important if="condition">` XML tags. This exploits the same XML tag pattern used in Claude Code's own system prompt, giving the model an explicit relevance signal that cuts through the "may or may not be relevant" framing.

## Principles

### 1. Foundational context stays bare, domain guidance gets wrapped

Not everything should be in an `<important if>` block. Context that is relevant to virtually every task — project identity, project map, tech stack — should be left as plain markdown at the top of the file. This is onboarding context the agent always needs.

Domain-specific guidance that only matters for certain tasks — testing patterns, API conventions, state management, i18n — gets wrapped in `<important if>` blocks with targeted conditions.

The rule of thumb: if it's relevant to 90%+ of tasks, leave it bare. If it's relevant to a specific kind of work, wrap it.

### 2. Conditions must be specific and targeted

Bad — overly broad conditions that match everything:
```
<important if="you are writing or modifying any code">
- Use absolute imports
- Use functional components
- Use camelCase filenames
</important>
```

Good — each rule has its own narrow trigger:
```
<important if="you are adding or modifying imports">
- Use `@/` absolute imports (see tsconfig.json for path aliases)
- Avoid default exports except in route files
</important>

<important if="you are creating new components">
- Use functional components with explicit prop interfaces
</important>

<important if="you are creating new files or directories">
- Use camelCase for file and directory names
</important>
```

### 3. Keep it short, use progressive disclosure sparingly

Do not shard into separate files that require the agent to make tool calls to discover, unless the extra context is incredibly verbose or complex.

The whole point of `<important if>` blocks is that everything is inline but conditionally weighted — the agent sees it all but only attends to what matches.

Prefer to keep the file concise.

### 4. Less is more

- Frontier models can reliably follow a few hundred. Claude Code's system prompt and tools already use ~50 of those. Your CLAUDE.md should be as lean as possible.
- Cut any instruction that a linter, formatter, or pre-commit hook can enforce
- Cut any instruction the agent can discover from existing code patterns. LLMs are in-context learners — if your codebase consistently uses a pattern, the agent will follow it after a few searches.
- Cut code snippets. They go stale and bloat the file. Use file path references instead (e.g., "see `src/utils/example.ts` for the pattern").

### 5. Keep all commands

Do not drop commands from the original file. The commands table is foundational reference — the agent needs to know what's available even if some commands are used less frequently.

## Output Structure

When rewriting a CLAUDE.md, produce this structure:

```
# CLAUDE.md

[one-line project identity — what it is, what it's built with]

## Project map
[directory listing with brief descriptions]

<important if="you need to run commands to build, test, lint, or generate code">
[commands table — all commands from the original]
</important>

<important if="<specific trigger for rule 1>">
[rule 1]
</important>

<important if="<specific trigger for rule 2>">
[rule 2]
</important>

... more rules, each with their own block ...

<important if="<specific trigger for domain area 1>">

[guidance]

</important>

... more domain sections ...
```

## How to Apply

When given an existing CLAUDE.md to improve:

1. **Identify the project identity** — extract a single sentence describing what this is. Leave it bare at the top.
2. **Extract the directory map** — keep it bare (no `<important if>` wrapper). This is foundational context.
3. **Extract the tech stack** — if present, keep it bare near the top. Condense to one or two lines.
4. **Extract commands** — keep ALL commands from the original. Wrap in a single `<important if>` block.
5. **Break apart rules** — split any list of rules into individual `<important if>` blocks with specific conditions. You can group rules, but never group unrelated rules under one broad condition.
6. **Wrap domain sections** — testing, API patterns, state management, i18n, etc. each get their own block with a condition describing when that knowledge matters.
7. **Delete linter territory** — remove style guidelines, formatting rules, and anything enforceable by tooling. Suggest replacing with pre-push or pre-commit hooks.
8. **Delete code snippets** — replace with file path references.
9. **Delete vague instructions** — remove anything like "leverage the X agent" or "follow best practices" that isn't concrete and actionable.

## Example

Input:
```markdown
# CLAUDE.md

This is an Express API with a React frontend in a Turborepo monorepo.

## Commands

| Command | Description |
|---|---|
| `turbo build` | Build all packages |
| `turbo test` | Run all tests |
| `turbo lint` | Lint all packages |
| `turbo dev` | Start dev server |
| `turbo storybook` | Start Storybook |
| `turbo db:generate` | Generate Prisma client |
| `turbo db:migrate` | Run database migrations |
| `turbo analyze` | Bundle analyzer |

## Project Structure

- `apps/api/` - Express REST API
- `apps/web/` - React SPA
- `packages/db/` - Prisma schema and client
- `packages/ui/` - Shared component library
- `packages/config/` - Shared configuration

## Coding Standards

- Use named exports
- Use functional components with TypeScript interfaces for props
- Use camelCase for variables, PascalCase for components
- Prefer `const` over `let`
- Always use strict equality (`===`)
- Use template literals instead of string concatenation
- Write JSDoc comments for all public functions
- Use barrel exports in index.ts files

## API Development

- All routes go in `apps/api/src/routes/`
- Use Zod for request validation
- Use Prisma for database access
- Error responses follow RFC 7807 format
- Authentication via JWT middleware

## Testing

- Jest + Supertest for API tests
- Vitest + Testing Library for frontend
- Test fixtures in `__fixtures__/` directories
- Use `createTestClient()` helper for API integration tests
- Mock database with `prismaMock` from `packages/db/test`

## State Management

- Zustand for global client state
- React Query for server state
- URL state via `nuqs`
```

Output:
```markdown
# CLAUDE.md

Express API + React frontend in a Turborepo monorepo.

## Project map

- `apps/api/` - Express REST API
- `apps/web/` - React SPA
- `packages/db/` - Prisma schema and client
- `packages/ui/` - Shared component library
- `packages/config/` - Shared configuration

<important if="you need to run commands to build, test, lint, or generate code">

Run with `turbo` from the repo root.

| Command | What it does |
|---|---|
| `turbo build` | Build all packages |
| `turbo test` | Run all tests |
| `turbo lint` | Lint all packages |
| `turbo dev` | Start dev server |
| `turbo storybook` | Start Storybook |
| `turbo db:generate` | Regenerate Prisma client after schema changes |
| `turbo db:migrate` | Run database migrations |
| `turbo analyze` | Bundle analyzer |
</important>

<important if="you are adding or modifying imports or exports">
- Use named exports (no default exports)
</important>

<important if="you are creating new components">
- Use functional components with TypeScript interfaces for props
</important>

<important if="you are adding or modifying API routes">

- All routes go in `apps/api/src/routes/`
- Use Zod for request validation
- Use Prisma for database access
- Error responses follow RFC 7807 format
- Authentication via JWT middleware
</important>

<important if="you are writing or modifying tests">

- API: Jest + Supertest
- Frontend: Vitest + Testing Library
- Test fixtures in `__fixtures__/` directories
- Use `createTestClient()` helper for API integration tests
- Mock database with `prismaMock` from `packages/db/test`
</important>

<important if="you are working with state management, stores, or URL parameters">

- Zustand for global client state
- React Query for server state
- URL state via `nuqs`
</important>
```

What was removed and why:
- camelCase/PascalCase, const vs let, strict equality, template literals, JSDoc, barrel exports — linter and formatter territory, or discoverable from existing code patterns
- Coding Standards as a grouped section — split into targeted blocks by trigger condition

What was NOT removed:
- All commands kept (including dev, storybook, analyze)
- Project map left bare (foundational context, relevant to every task)
