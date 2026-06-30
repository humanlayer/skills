---
name: design-control-loop
description: interview the user to design an agentic control loop (sensor, controller, actuator under disturbances) tailored to their codebase, then build it as locally-runnable components plus a scheduled coding-agent workflow
---

# Design Control Loop

Use this skill when a user wants to drive some property of their codebase toward a target with small, low-risk, reviewable changes on a schedule — an **agentic control loop**.

Your job is to **interview the user, design the loop _with_ them, and then build it for them**. The design must be tailored to *their* codebase and the tooling they already use. There is no fixed toolset and no template to reproduce: propose options grounded in what you find in the repo, discuss trade-offs, agree on a design, then implement it.

## The mental model

Borrow from control theory. The codebase is a dynamic system being changed continuously (by teammates, dependencies, and generated code — the **disturbances**). A control loop drives it toward a desired state instead of all at once:

- **Set point** — the desired end state for some property of the codebase.
- **Sensor** — measures the current state, producing the gap to the set point.
- **Controller** — decides the next small, low-risk change from that measurement.
- **Actuator** — a coding agent that applies the change and opens a PR.
- The result feeds back into the next run. A human stays *on* the loop to steer it.

Read `references/control-loop-taxonomy.md` and walk the user through these concepts before designing anything. For one fully worked example, see `references/example-control-loop.md` — treat it as an illustration, not a blueprint.

## How to run this skill

- **Read the repo before you ask** (Phase A). Come to the interview with proposals, not a blank form.
- **Tailor every component.** The right sensor, controller, and actuator depend entirely on the user's problem and stack. The lists in the references are examples to spark discussion, never a checklist to push.
- **Make each component runnable locally and standalone before wiring it into CI** (Phase D). The workflow should only orchestrate pieces the user can already run by hand.
- **Capture the agreed design in writing** before building, so the user can correct it cheaply.

## Outputs

Create or update these in the target repo, tailored to the agreed design:

- The **sensor** and **controller** as version-controlled commands/scripts the user can run locally.
- `.claude/skills/<skill-name>/SKILL.md` — the **actuator** skill capturing the agent's judgement (path may be `.agents/skills/...` per repo convention).
- The recurring **workflow** that runs the loop and opens a PR (GitHub Actions by default; whatever CI the repo uses).
- A **memory/feedback file** that carries standing feedback between runs.
- Optionally, a **dampener** (regression gate) that keeps the problem from getting worse while the loop improves it.

## Workflow

### Phase A — Understand the system

**Read the following references:** `references/example-control-loop.md`.

Read before asking setup questions:

- Existing CI: `.github/workflows/*.yml`, `.github/actions/**`, or the repo's non-GitHub CI config — runner, checkout, dependency install, cache, and PR conventions.
- Package manager files (`package.json`, `bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, …).
- Existing validation scripts: typecheck, lint, test, quality, format, and package-scoped commands.
- Existing `.claude/skills` / `.agents/skills` and any existing agent loops (workflows, `agent-memory`, where glue scripts live) to mirror conventions instead of inventing new ones.
- The static-analysis, linting, codegen, and test tooling already in the repo — these are the most likely raw material for a sensor.
- Discover packages, services, and repo purpose at a high level. 

Completion criterion: you can name the repo's package manager, install command, likely validation commands, CI platform, and any existing loop conventions. You understand the packages/services/applications it contains at a high level.

### Phase B — Design the loop with the user

**Read the following references:** `references/control-loop-taxonomy.md`, `references/example-control-loop.md`, `references/agent-runner-templates.md`.

This is an interview. Work through each component below. Start by asking the user questions about the set point. Proposing options grounded in Phase A and surfacing trade-offs rather than mandating any choice. Record the decisions as you go.

1. **Set point.** What property are we driving, and to what target? Examples: an invariant ("no procedures use the old pattern"), a threshold ("test coverage ≥ X in these packages"), or a direction ("reduce occurrences each run"). Also pin the **scope**: which directories/packages the loop may change, and which it may only read.

2. **Sensor.** How will the loop measure the gap to the set point? Inspect the codebase and the user's existing tooling and propose the options that fit *their* stack — a static-analysis or lint tool, a structural/AST search, a test suite, a type checker, a telemetry or error query, a custom script, or even an agent-based check. Discuss the trade-offs that matter to them (stability, cost, repeatability, and whether the measurement can be silently disabled) instead of mandating any property. Aim for a measurement the controller can act on repeatably.

3. **Controller.** How will the loop choose the next increment from the measurement, sized to stay low-risk and reviewable? Design this *with* the user: how to prioritize targets, how big one increment is, and what "one reviewable unit of work" means here. A controller can be anything from fully deterministic (a script that selects the next target) to fully agentic (an agent that decides from natural-language criteria), and it may be **fused** with the sensor or the actuator. The controller is the part you will **tune over time** from loop output — start simple and expect to revise it.

4. **Actuator.** A coding agent plus a repo-local skill applies the change.
   - **Agent + credentials.** Pick the CLI coding agent (Claude Code, Codex, OpenCode, CodeLayer, …), its secret, and its headless command from `references/agent-runner-templates.md`.
   - **Golden patterns first.** Before automating, establish what a good change looks like: ask the user whether existing patterns in the codebase should be followed, and inspect the code to find them. Capture these in the actuator skill (Phase C).
   - **Validation.** Decide which commands must pass before the agent commits (propose these from Phase A and confirm).

5. **Disturbances + dampener (offer).** Name what changes the system outside the loop (teammates shipping concurrently, dependency bumps, generated code). Then **offer** a dampener: a check that keeps the measured problem from getting worse while the scheduled loop chips away at it — for example a PR check that compares the sensor's output against a baseline and surfaces (or eventually blocks) newly introduced deviations. This is optional; some loops do not need one.

Completion criterion: a short written design naming the set point, sensor, controller, actuator (agent + skill + validation), and disturbances/dampener — with each component something the user can run locally.

### Phase C — Build the actuator skill

**Read the following references:** `references/skill-template.md`, `references/example-skill.md`, `references/response-template.md`.

Write a repo-local skill that captures the actuator's judgement for this task. It can use repo-specific paths, package names, and conventions since it lives in the repository.

- Put ordered behavior in `SKILL.md` as steps with checkable completion criteria; move long templates and examples into sibling reference files.
- Encode the golden patterns from Phase B4 so the agent follows established conventions.
- Keep one source of truth for each rule; do not repeat the same guidance in the skill, the prompt, and the memory file.
- Include a response template (e.g. `references/response-template.md`) defining how the agent formats its final output, which becomes the PR body. Instruct the skill to read and follow it.
- Use `references/skill-template.md` as the skeleton and `references/example-skill.md` as a concrete example. See https://agentskills.io/specification for the skill spec.

**IMPORTANT:** the `name` in the skill's frontmatter must match its directory slug — a skill named `migrate-foo` lives at `.claude/skills/migrate-foo/SKILL.md` (or `.agents/skills/migrate-foo/SKILL.md`).

Completion criterion: the skill explains the job clearly enough that the agent can do it unattended, including how to format its final response.

### Phase D — Make each component runnable locally

**Read the following references:** `references/agent-runner-templates.md`.

Before any CI exists, land the sensor and controller as version-controlled commands or scripts (follow the repo's convention for where such scripts live), and verify the whole loop works by hand:

- Run the **sensor** standalone and confirm it produces a stable, usable measurement.
- Run the **controller** on real sensor output and confirm it selects a sensible next increment.
- Run the **actuator** locally via its headless CLI command on a controller-selected target, and confirm it makes the change and passes validation.

Only proceed to CI once each piece runs locally on its own. This keeps the loop debuggable and makes the workflow a thin orchestrator of things the user can already run.

Completion criterion: the user can run sensor, controller, and actuator locally and independently.

### Phase E — Wire the loop into CI

**Read the following references:** `references/workflow-template.yml`, `references/prompt-template.md`, `references/agent-runner-templates.md`.

Assemble the components into a recurring job. GitHub Actions is the default because it already has the code, the secrets, version control, and scheduling/dispatch — but use whatever CI the repo uses.

- Run the loop as **discrete steps: sensor → controller → actuator**, then commit and open a PR using the agent's final message as the body. (When components are fused — e.g. the sensor already prioritizes, or one agent both selects and changes — collapse them into a single step; do not invent separation the design does not have.)
- Reusable logic can live in a custom composite action.
- Decide the **cadence** (daily, weekdays, weekly, monthly, manual-only, or custom cron) based on task risk and review burden.
- Interpolate the memory file (Phase F) into the actuator's context.
- Use `references/workflow-template.yml` as the base and `references/prompt-template.md` for the embedded prompt. Pull the agent run + response-extraction steps from `references/agent-runner-templates.md` (each agent outputs differently; get the final response into `/tmp/pr-body.md`).

Completion criterion: the workflow can run from `workflow_dispatch` without relying on files that do not exist.

### Phase F — Put a human on the loop

**Read the following references:** `references/memory-template.md`, `references/agent-iteration.ts`.

A scheduled loop drifts without steering. Give the human two channels, both of which should change future behavior, not just the current PR:

- **Memory/feedback file.** A version-controlled markdown file (e.g. `.github/agent-memory/<task-slug>.md`) loaded deterministically into the actuator's context **after the controller** on every run. Use `references/memory-template.md`. Good entries: permanent scope exclusions, known false-positive areas, and reviewer feedback that should change future selections — not one-off instructions or single-run logs.
- **`/iterate` on the PR.** Label each loop's PRs and embed a hidden marker so each workflow only handles comments on PRs it created. When a maintainer comments `/iterate`, the matching workflow loads the PR context (diff, comments) and the feedback, and the agent updates its memory and the PR. Install `references/agent-iteration.ts` (modes: `footer` and `prompt`) where the repo keeps CI scripts.

Frame this for the user as **how you tune the controller and skill over time** — the loop gets better because a human keeps correcting it.

Completion criterion: standing feedback survives between runs, and `/iterate` (if enabled) updates the existing PR.

### Phase G — Flow control

**Read the following references:** `references/workflow-template.yml`.

Bound work-in-progress so the loop never produces PRs faster than they can be reviewed. **Recommended default: one open PR per loop.**

- The workflow checks for open PRs with this loop's label and no-ops on scheduled runs when the bound is met; manual `workflow_dispatch` runs bypass the check.
- Decide PR metadata: label name, PR title prefix, branch prefix.

Without this, a daily loop can stack up duplicate or conflicting PRs while no one is reviewing. Completion criterion: scheduled runs no-op when the open-PR bound for this loop is already met.

### Phase H — Validate, dry-run, and iterate faster

**Read the following references:** `references/workflow-template.yml`.

**Validate** the workflow YAML (`bunx js-yaml file.yml`, `python -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" file.yml`, or `yq`) and confirm every path named by the skill, workflow, and memory file exists or is created by this task.

**Dry-run.** A workflow cannot be `workflow_dispatch`-ed until it has run once. Temporarily add a `push` trigger for the current branch, push, watch it run, then remove the trigger. Review any PR it opens to confirm the loop's behavior.

**Ready to iterate faster** (once the loop is tuned and producing consistent, high-quality output): increase the schedule frequency; widen the controller's batch (e.g. select N targets per run); run the sense→control→actuate cycle N times per workflow run; or run the workflow multiple times and assign one PR to each teammate.

Completion criterion: the workflow YAML parses, all referenced files exist, and the loop has produced at least one reviewed PR.

## Reference Files

Each phase above names the references relevant to it — read each one when you reach that phase. Full index:

- `references/control-loop-taxonomy.md` — the control-loop components and the design questions to ask; read this first and use it to teach the user.
- `references/example-control-loop.md` — one fully worked loop, annotated component-by-component. An illustration, not a template.
- `references/agent-runner-templates.md` — local + CI headless commands and secrets for Claude Code, Codex, OpenCode, and CodeLayer, with response extraction.
- `references/workflow-template.yml` — recurring loop workflow skeleton with discrete sensor/controller/actuator steps.
- `references/prompt-template.md` — embedded prompt structure for the actuator step.
- `references/memory-template.md` — memory/feedback file skeleton.
- `references/skill-template.md` — skeleton for the generated actuator skill.
- `references/response-template.md` — examples for how the agent should format its final response (the PR body).
- `references/example-skill.md` — a concrete example of a well-formed task skill.
- `references/agent-iteration.ts` — helper for `/iterate` support (PR footer marker + iteration prompt building).
