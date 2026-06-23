# Context

You are <task summary> in this repository. Begin by using the `<skill-name>` skill.

# Scope

Focus only on `<primary path or package>`.

You may inspect `<secondary path>` only when it is necessary to understand or validate the primary change.

# Instructions

1. <Find high-confidence targets.>
2. <Pick a small, reviewable set of changes.>
3. <Use the real source of truth, not support-only examples.>
4. <Avoid adjacent cleanup that belongs to another workflow.>
5. Validate with the commands below.
6. Commit and push your changes.

## Validation Commands

```bash
<validation command 1>
<validation command 2>
```

## Important Rules

- <Rule that prevents the most likely wrong change.>
- <Rule that keeps scope narrow.>
- Do not run long integration tests unless explicitly requested.
- You are running in a sandbox or CI runner environment. Do not stop and ask for feedback from the user or request approvals.

## Agent Memory

${MEMORY_CONTENT}

## Finishing Up

When you are finished:

1. Make sure the validation commands pass.
2. Commit and push your changes.
3. Answer with the output format below.

## Output Format

Format your final answer as GitHub-flavored markdown:

```markdown
## <Task Title> Complete

### Changes Made
- [file/component]: [what changed and why]

### Source Of Truth Checked
- [path]: [why it supports the change]

### Validation
- [x] <validation command 1> passed
- [x] <validation command 2> passed
```
