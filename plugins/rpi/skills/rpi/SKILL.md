---
name: rpi
description: Only use when the user explicitly invokes this skill by name.
---

# Research, Design, and Implement

Help the user research a change, work through its design, and implement it. Follow their requested step, using the phase instructions below.

`$SKILLBASE` means the directory containing this `SKILL.md`.

`<rpi-invocation>` in templates means the host's skill command: `$rpi` in Codex, `/rpi` in Claude Code, or its plugin-qualified name when the host exposes one. Render next commands with that native invocation.

## Choose the Step

Follow the user's requested step. Read `$SKILLBASE/references/workflow.md` when choosing or explaining a flow or what comes next.

For a task description with no requested step, start with research questions. Ask which flow the user wants: research followed by design discussion, PRD, or TDD, or research only. Wait for their choice before starting the phase, then carry it into suggested next commands.

When asking the user to choose a flow, read `$SKILLBASE/references/workflow-choice.md` and show its ASCII chart with the question.

Create writes a new document; iterate updates an existing document in place using the user's feedback or resumes the workflow for a partially finished document.

Load the matching process from `$SKILLBASE/references/<step>/process.md`:

| Request | Step |
| --- | --- |
| Research questions | `create-research-questions` or `iterate-research-questions` |
| Research | `create-research` or `iterate-research` |
| Design discussion | `create-design-discussion` or `iterate-design-discussion` |
| Product requirements / PRD | `create-prd` or `iterate-prd` |
| Technical design / TDD | `create-tdd` or `iterate-tdd` |
| Implementation outline | `create-structure-outline` or `iterate-structure-outline` |
| Implement | `implement-outline` |
| Implementation feedback or fixes | `iterate-implementation` |

Update an existing document by default; create one when needed or requested. When several match, use the newest and name the chosen file.

## Use the Task Directory

Use the directory supplied by the user.

Otherwise, look for existing task directories in `.agents/artifacts/` whose names and workflow filenames match the request or current task branch. Reuse an obvious match without asking. If a directory looks close but could belong to a different task, or several directories look plausible, ask the user which to use before writing. Read only documents allowed by the selected phase when checking a match.

When no existing directory fits, use `.agents/artifacts/<branch-name>` with `/` replaced by `-` if the branch identifies the task. On `main`, or when no branch identifies the task, choose a short kebab-case slug from the request and use `.agents/artifacts/<task-slug>` without asking for approval. State the selected path and reuse or create the directory as needed.

Save at the selected path. If the sandbox blocks writes there, ask for scoped write access or a writable task directory and wait for the user's choice.

The RPI framework authors recommend not committing the artifacts.

Number new workflow documents using the next available `NN-` prefix in the task directory. Keep the existing path when updating a document. Save supporting mockups and diagrams beside the documents and link them as ordinary local files.

Workflow document frontmatter includes `repos`, a list of zero or more repositories with `identifier` and `sha` for each entry. Use `repos: []` when none apply. Quote string values as needed for valid YAML.

## Suggest the Next Step

Use the phase's handoff instructions and `$SKILLBASE/references/workflow.md` to choose what comes next. Users run each phase in a separate context window by default. When suggesting a next command, include the task directory and chosen flow. Say they can run it here, after compaction, or in a new session.

Use artifact filenames to locate the current phase when asked what's next, then read its document for unfinished work and settled choices. Recognize `prd` or `product-requirements`, `tdd` or `tech-design`, and `structure-outline` or `outline`.

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
