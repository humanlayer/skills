---
name: rpi
description: Only use when the user explicitly invokes this skill by name.
---

# Research, Design, and Implement

Help the user research a change, work through its design, and implement it. Follow their requested step, using the phase instructions below.

## How the Workflow Fits Together

Choose the shortest path that gives the user the review points they need:

| Work | Usual path after research questions and research |
| --- | --- |
| A change with a few product and technical choices | Design discussion -> outline -> implementation |
| A feature with open product questions | PRD -> TDD -> outline -> implementation |
| A technical fix, cleanup, or refactor | TDD -> outline -> implementation |
| Research before coding, with design steps skipped | Research -> implementation |

An outline is useful for work that benefits from testable phases. The user can move straight to implementation after research or any design step, or start at any step when they already have enough context.

Read `$SKILLBASE/references/workflow.md` for phase roles, review points, and examples when explaining the workflow or choosing what comes next.

## Choose the Step

For a task description with no requested step, start with research questions. First ask which flow the user wants: research followed by design discussion, PRD, or TDD, or research only. Carry that choice into suggested next commands.

Load the matching process from `$SKILLBASE/references/<step>/SKILL.md`:

Create writes a new document; iterate updates an existing document in place using the user's feedback or resumes the workflow for a partially finished document.

| Request | Step |
| --- | --- |
| Research questions | `create-research-questions` or `iterate-research-questions` |
| Research | `create-research` or `iterate-research` |
| Design discussion | `create-design-discussion` or `iterate-design-discussion` |
| Product requirements / PRD | `create-prd` or `iterate-prd` |
| Technical design / TDD | `create-tdd` or `iterate-tdd` |
| Implementation outline | `create-structure-outline` or `iterate-structure-outline` |
| Implement | `implement-outline` |

Update an existing document by default; create one when needed or requested. When several match, use the newest and name the chosen file.

## Use the Task Directory

Use the directory supplied by the user. Otherwise, use `.agents/artifacts/<branch-name>` with `/` replaced by `-`. On `main`, ask for a task slug. Reuse the directory or create it as needed.

Before writing artifacts, check `git check-ignore --quiet --no-index -- .agents/artifacts`. If the directory needs an ignore rule, add `.agents/artifacts/` to the repository's `.gitignore`. Treat Git errors separately from a path that needs an ignore rule.

For research, load the research-questions document as the task context. For other steps, load the task directory's frontmatter-bearing workflow documents. Read supporting images, mockups, and diagrams as needed. Run the design interview in the main conversation, with the saved research as context.

## Suggest the Next Step

Users run each phase in a separate context window by default. End with a suggested `/rpi` command that includes the task directory and chosen flow. Say they can run it here, after compaction, or in a new session.

Use artifact filenames to infer progress when asked what's next. Recognize `prd` or `product-requirements`, `tdd` or `tech-design`, and `structure-outline` or `outline`.

After research, suggest the chosen design step, or implementation for a research-only flow. When a flow has not been chosen, ask what the user wants next and recommend design discussion for a small change with clear options, PRD for open product questions, or TDD for technical fixes and refactoring.

After research or design, offer an outline or direct implementation. Implementation uses the workflow documents available and records progress in the outline when one exists. With an outline, pause between phases by default so the user can test; follow a request to complete all phases. Without an outline, complete the change in one run. After implementation, suggest the separate `/visual-pr` skill.

## Use Subagents

Use the bundled agent instructions for `codebase-locator`, `codebase-analyzer`, `codebase-pattern-finder`, `web-search-researcher`, and `outline-implementer-agent` as directed by each phase.

<important if="you do not have an Agent() or Task() or other tool for running subagents">
  read the subagent instructions from $SKILLBASE/references/subagents/SUBAGENT_NAME.md
</important>

<important if="you have a tool for running subagents or delegated sessions, but the named subagents are not available">
  read the subagent instructions from $SKILLBASE/references/subagents/SUBAGENT_NAME.md and pass them into the subagent with your main prompt, with
<instructions>
REFERENCE_CONTENTS
</instructions>
<message>
YOUR_MESSAGE ON WHAT TO LOOK FOR OR BUILD
</message>
</important>

Use available web tools for research. When web access is unavailable, note that limit and continue with code and local documentation. Link mockups and diagrams as ordinary local files.
