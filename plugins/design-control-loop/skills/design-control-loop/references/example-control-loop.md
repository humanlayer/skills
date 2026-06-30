# Example Control Loop: React Doctor

One fully worked loop, to make the taxonomy concrete. **This is an illustration, not a template.** A real loop from a production monorepo, it drives React code quality in a single app. Your loop's set point, sensor, controller, and actuator will look different — copy the *shape*, not the specifics.

It is a useful example because the sensor and controller come almost entirely from an existing, configurable tool, so the whole loop is small.

## Set point

`apps/riptide-ui` stays free of high-impact React issues (lint, accessibility, correctness, architecture). A direction more than a fixed threshold: each run leaves the app a little healthier.

## Sensor — `react-doctor` + `doctor.config.ts`

The [`react-doctor`](https://github.com/millionco/react-doctor) CLI scans the app and reports prioritized issues; `doctor.config.ts` configures which rules run and which paths/rules are ignored. It runs locally exactly as it does in CI:

```bash
bunx react-doctor --project '@codelayer/riptide-ui' --diff false --yes
```

Chosen because it is repeatable, configurable, and lives outside the editor/lint config so a stray inline comment can't quietly switch it off — a trade-off that mattered *for this team*, not a requirement of all sensors.

## Controller — fused with the sensor

There is no separate controller: `react-doctor` returns "the top 3 rules by impact," and the loop's policy is "fix up to 5 issues from those top 3 rules this run." That selection logic lives in the actuator's prompt. This is the **sensor + controller blur** — one tool plus a small policy does both jobs.

## Actuator — CodeLayer + a repo-local skill

A CodeLayer agent runs with the repo's `react-doctor` skill. Its per-issue loop gives the agent three honest options — **fix**, **ignore** (add to `doctor.config.ts` with a reason), or **skip** (leave for a human) — and validates each change before committing it separately:

```bash
bun run typecheck
bun run quality
bunx react-doctor --project '@codelayer/riptide-ui' --staged   # no new issues in staged files
```

## Disturbances + dampener

**Disturbance:** teammates ship React code continuously while the loop runs.

**Dampener:** a second workflow (`react-doctor.yml`) runs on every pull request and on pushes to `main`. It diffs against the merge base and comments on only the *newly introduced* issues. It is **advisory by default** (never red-Xes a teammate's PR), with a documented path to graduate to blocking once the team trusts the signal. This keeps the problem from getting worse while the scheduled loop chips away at it.

## The loop — `agent-react-doctor.yml`

A scheduled workflow (daily, plus manual dispatch and `/iterate`) runs the loop and opens a PR whose body is the agent's final message. Because the sensor, controller, and actuator are fused into one agent step here, the workflow does **not** have three separate steps — it collapses them, matching the design. A loop with a deterministic, standalone sensor and controller would instead have discrete steps.

## Human on the loop

- `.github/agent-memory/react-doctor.md` is loaded into the agent every run — standing feedback like "always use the `no-use-effect` skill for `useEffect` fixes" and "don't globally ignore a rule when only specific files need an exemption."
- Maintainers comment `/iterate` on the PR; a hidden marker in the PR body routes the comment to the workflow that created it, which loads the PR context and feedback and updates the memory file and the PR. Deterministic glue lives in `ci-scripts/` (`agent-iteration.ts`, `codelayer-output.ts`).

## Flow control

Every PR is labeled `agent-react-doctor`. Scheduled runs no-op when an open PR with that label already exists, so there is at most one open PR per loop; manual dispatch bypasses the gate.

## What to take from this

- **Reusable shape:** set point → sensor → controller → actuator under disturbances, plus a dampener, a memory file, `/iterate` steering, and one-PR flow control.
- **Not reusable:** `react-doctor`, the bun/CodeLayer commands, the "top 3 rules / 5 fixes" policy, the `riptide-ui` scope. Those are tailored to this repo — yours come from your interview.
