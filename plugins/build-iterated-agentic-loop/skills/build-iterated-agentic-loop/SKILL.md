---
name: build-iterated-agentic-loop
description: build a repo-local skill and install a matching iterated coding-agent GitHub Actions workflow, prompt, memory file, and reference templates
---

# Build Iterated Agentic Loop

Use this skill when the user wants to turn a repeatable agent task into a repo-local skill plus a GitHub Actions workflow that runs a coding agent on a schedule, manually, or both.

The target shape is an iterated agentic loop: a focused skill defines the agent's judgement, a workflow invokes a coding agent with a repo-specific prompt, an agent-memory file carries standing feedback between runs, and each workflow labels its PRs so only one open PR exists per loop. The `narrow-react-prop-types` skill is the concrete reference pattern.

## Outputs

Create or update these files in the target repo:

- `.claude/skills/<skill-name>/SKILL.md` for the repo-local agent behavior.
- `.github/workflows/agent-<task-name>.yml` for the recurring coding-agent automation.
- `.github/agent-memory/<task-name>.md` for stable feedback and scope constraints.
- Optional references under `.claude/skills/<skill-name>/references/` when the skill needs templates, examples, or long supporting material.

## Workflow

### 1. Explore the target repo

Read before asking setup questions:

- Existing `.github/workflows/*.yml` and `.github/actions/**` to understand runner, checkout, dependency install, cache, and PR patterns.
- Package manager files such as `package.json`, `bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `pyproject.toml`, `go.mod`, or `Cargo.toml`, or other package management-related files
- Existing validation scripts, especially typecheck, lint, test, quality, format, and package-scoped commands.
- Existing `.claude/skills` and `.agents/skills` to avoid duplicating conventions.

Completion criterion: you can name the repo's package manager, install command, likely validation commands, and existing workflow conventions.

### 2. Ask setup questions

Walk the user through these decisions. Recommend defaults from repo evidence instead of presenting a blank form.

1. **Coding Agent**: Claude Code, Codex, OpenCode, or CodeLayer. Explain the required secret and headless command for the recommended choice. Use `references/agent-runner-templates.md`. CodeLayer is Humanlayer's ultra-lightweight agent harness.
2. **Cadence**: daily, weekly, weekdays, monthly, manual-only, or custom cron. Recommend a cadence based on task risk and review burden - most likely weekdays, daily, or weekly. 
3. **Task**: What task should the agent loop accomplish?
  - Are there existing skills for doing this? (you can do research before asking the user this)
  - Ask the user if you should look at recent PRs, git history, or other particular parts of the codebase for reference.
4. **Scope**: which directories/packages the loop may change and which it may only inspect
5. **Validation**: which commands must pass before the agent commits (You should propose this to the user based on your earlier research and ask them to confirm)
6. **PR bounding**: Ask if scheduled runs should no-op when open PRs from this agent already exist, and if so, how many open PRs to allow before blocking new runs.
  - **Recommended: Yes, bound to 1 open PR per agent loop.** This prevents the agent from creating unbounded work that piles up faster than humans can review. Without bounding, a daily agent could generate 5+ unreviewed PRs in a week, creating review fatigue and merge conflicts.
  - The workflow uses a label (e.g., `agent-<task-slug>`) to identify PRs from each agent loop. Scheduled runs check `gh pr list --label <label> --state open` and skip if the count meets or exceeds the bound.
  - Manual `workflow_dispatch` runs bypass the bound check, allowing forced runs when needed.
7. **PR metadata**: label name, PR title prefix, and branch prefix.
  - Suggest `[MM/DD][Agent: <Agent Name>]: <Concise Description>` as a template, e.g. `[6/23][Agent: Effect Migrator]: Migrate XYZ module`
8. **Response format**: How should the CI agent format its final response (which becomes the PR body)?
  - Show the user `references/response-template.md` for examples (fix/migration, generation, refactor).
  - Ask what information reviewers need: summary stats, risk levels, verification steps, file lists, etc.
  - Create a customized response template that the generated skill will reference in its `references/` directory
9. **Iteration behavior**: whether `/iterate` comments should update the existing PR.
  - If enabled, install `references/agent-iteration.ts` to the repo. Ask the user's preferred location: `.github/scripts/`, `ci-scripts/`, or `scripts/`.
  - The script has two modes: `footer` (adds the PR body marker) and `prompt` (builds the iteration prompt from PR context).
  - If disabled, remove the `issue_comment` trigger and iteration-only steps from the workflow.

Completion criterion: every placeholder in the workflow, prompt, and memory template has a chosen value or an explicit default.

### 3. Define the agent job

Extract the smallest repeatable job the agent should perform. Work through these three questions with the user:

**What are we finding?** How does the agent identify targets for this run?
- A CLI tool that reports issues (e.g., `bunx react-doctor`, `eslint --format json`)
- A search pattern (e.g., files matching `*.test.ts` without coverage, components using deprecated APIs)
- A diff or changelog (e.g., new dependencies since last release, changed files in a PR)
- An old pattern that should be replaced with a new pattern or migrated to a new framework
- A flaky test based on previous CI runs 

**What are we changing?** What transformation does the agent apply to each target?
- Fix: resolve a reported issue in place
- Migrate: update code from one pattern to another
- Generate: create new files based on existing sources
- Refactor: restructure without changing behavior

**How do we validate?** What proves the change is correct?
- Build/typecheck passes
- Tests pass (or a specific subset)
- The same tool that found the issue now reports it resolved
- Linting or formatting checks pass

Completion criterion: you can state the job in one sentence, e.g., "Find 5 react-doctor violations, fix them, and verify typecheck and quality pass."

### 4. Write the skill

Write a repo-local skill that captures the agent's judgement for this task. The skill can include repo-specific paths, package names, and conventions since it lives in this repository.

Use these skill-writing rules:

- Put ordered behavior in `SKILL.md` in the skill directory (`.claude/skill-slug-here` or `.agents/skill-slug-here` depending on repo patterns and user preferences) steps with checkable completion criteria  
- Move long templates and examples into sibling reference files, then point to them from `SKILL.md`.
- Keep one source of truth for each rule; do not repeat the same guidance in the skill, prompt, and memory file.
- Include a response template as a reference file (e.g., `references/response-template.md` under the skill directory) that defines how the CI agent should format its final output. The skill should instruct the agent to read and follow this template when formatting its final response which will be used as the PR body.
- Use the skill template in `references/skill-template.md`. An EXAMPLE skill can be found in `references/example-skill.md`
- You may refer to https://agentskills.io/specification to understand skill specification. 

**IMPORTANT**: the `name` field in the `SKILL.md` frontmatter must match the skill slug - e.g. a skill with name `fix-eslint-issues` must be in `.claude/skills/fix-eslint-issues/SKILL.md` or `.agents/skills/fix-eslint-issues/SKILL.md`



Completion criterion: the skill explains how to do the job clearly enough that the agent can follow it without additional prompting, including how to format the final response.

### 5. Write the workflow prompt

Put repo-specific targeting in the GitHub Actions prompt, not in the generic skill. Include:

- `Begin by using the <skill-name> skill.`
- Scope: directories/packages the agent may change and may inspect.
- Instructions: the reviewable unit of work, what to avoid, and how to validate.
- Validation commands in fenced bash if applicable
- Agent memory interpolation from `.github/agent-memory/<task-name>.md`.
- Finishing requirements: validate, commit, push, and return a PR-ready summary.

Use `references/workflow-template.yml` as the base template. Use `references/prompt-template.md` when drafting the embedded prompt.

Completion criterion: the prompt contains all repo-specific constraints needed for an unattended run.

### 6. Install the memory file

Create `.github/agent-memory/<task-name>.md` using `references/memory-template.md` as a starting point. The memory file carries standing feedback that should affect future runs. Keep it short.

Good memory entries:

- Permanent scope exclusions.
- Known false-positive areas.
- Review feedback that should change future agent selection.

Bad memory entries:

- One-off task instructions.
- Validation output from a single run.
- Rules already stated in the skill.

Completion criterion: deleting the memory file would lose useful future-run context, not just history.

### 7. Create the workflow

Create `.github/workflows/agent-<task-name>.yml` from `references/workflow-template.yml` and replace every placeholder.

Required customizations:

- Workflow name, cron, branch prefix, workflow id, agent label, PR title.
- Runner label and setup steps for the repo.
- Dependency install command.
- Coding-agent install, secret, and headless run command (from `references/agent-runner-templates.md`).
- Response extraction step: each agent outputs differently (JSON, stream-json, plain text). Use the agent-specific extraction from `references/agent-runner-templates.md` to get the final response into `/tmp/pr-body.md` for the PR body.
- Skill name, scope, validation commands, and memory path.
- PR bounding gate: the workflow checks for open PRs with the agent label before running. Configure the bound based on the user's choice from step 2 (default: 1). The gate uses `gh pr list --label "$AGENT_LABEL" --state open` and compares the count. If bounding is disabled, remove the gate step entirely.
- If `/iterate` is enabled: install `references/agent-iteration.ts` to the user's preferred location and update the workflow paths to match. The script handles both PR footer generation and iteration prompt building. This file can be run with the user's preferred typescript toolchain (node with type-stripping, **Bun (recommended)**, Deno, tsx, etc) or can at the user's request be rewritten into another language.

If `/iterate` is disabled, remove the `issue_comment` trigger, the iteration-only steps, and skip installing `agent-iteration.ts`.

Completion criterion: the workflow can run from `workflow_dispatch` without relying on files that do not exist.

### 8. Validate and verify

**Validate workflow YAML:** Before committing, parse the workflow file to catch syntax errors early. Use one of:

```bash
# Node.js / bun (js-yaml)
bunx js-yaml .github/workflows/agent-<task-name>.yml > /dev/null && echo "Valid YAML"

# Python
python -c "import yaml; yaml.safe_load(open('.github/workflows/agent-<task-name>.yml'))"

# yq (if installed)
yq eval '.name' .github/workflows/agent-<task-name>.yml
```

If the parser fails, fix the YAML syntax before proceeding.

**Verify references and paths:** Check that every path named by the skill, workflow, and memory file exists or is intentionally created by this task.

Completion criterion: the workflow YAML parses without errors and all referenced files exist.

### 9. Dry-run the workflow

GitHub Actions workflows cannot be manually dispatched via `workflow_dispatch` until they have run at least once. To bootstrap the workflow:

1. Temporarily add a `push` trigger for the current branch (if not main):
   ```yaml
   on:
     push:
       branches:
         - <current-branch-name>  # Remove after first run
     schedule:
       - cron: "0 13 * * *"
     workflow_dispatch:
       # ...
   ```

2. Commit and push all the new files (workflow, skill, memory file, scripts).

3. The workflow will trigger on push. Watch the Actions tab to verify it runs successfully.

4. After the first successful run, remove the temporary `push` trigger and push again. The workflow can now be dispatched manually via the Actions UI or `gh workflow run`.

5. If the dry-run creates a PR, review it to verify the agent behavior, then close or merge as appropriate.

Completion criterion: the workflow appears in the Actions tab and can be triggered via `workflow_dispatch`.

## Reference Files

- `references/workflow-template.yml` - coding-agent GitHub Actions workflow skeleton.
- `references/agent-runner-templates.md` - headless commands and secrets for Claude Code, Codex, OpenCode, and CodeLayer.
- `references/agent-iteration.ts` - helper script for `/iterate` support (PR footer and iteration prompt building). Install to `.github/scripts/`, `ci-scripts/`, or `scripts/` based on user preference.
- `references/prompt-template.md` - embedded prompt structure for the workflow.
- `references/memory-template.md` - agent-memory file skeleton.
- `references/skill-template.md` - skill skeleton for the generated task skill.
- `references/response-template.md` - examples for how the CI agent should format its final response (PR body).
- `references/example-skill.md` - example skill