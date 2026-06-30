---
name: <skill-name>
description: <leading verb> <task> when <trigger>; use <source of truth> instead of <wrong source>
---

# <Skill Title>

Use this skill when <the user or workflow asks for the repeatable agent task>.

The goal is to <one-sentence invariant the agent should preserve>.

## Core Requirements

- <Rule that identifies the live source of truth.>
- <Rule that names inputs that must not drive the decision.>
- <Rule that keeps the change reviewable.>
- <Rule that defines the validation bar.>

## Workflow

### 1. Find the target

<How to identify candidate files/components/issues.>

Completion criterion: <observable condition that proves the target was selected correctly>.

### 2. Inspect the source of truth

<What to read before editing.>

Completion criterion: <observable condition that proves the agent did enough legwork>.

### 3. Make the smallest safe change

<How to edit without broadening scope. Include multiple steps / workflow if necessary.>

Completion criterion: <observable condition that proves the change matches the source of truth>.

### 4. Validate

Run the narrowest relevant validation first, then the repo-required quality gate.

Completion criterion: validation passes or the final report names the exact blocker.

### 5. Format the response

When running as a CI agent, format your final response according to `references/response-template.md`. This response becomes the PR body.

Completion criterion: the response follows the template structure and includes all required information for reviewers.

## Review Checklist

- The source of truth was inspected before editing.
- The change does not encode support-code-only states as real behavior.
- The diff is small enough to review.
- The validation command passed or the blocker is documented.
- The final response follows the response template.
