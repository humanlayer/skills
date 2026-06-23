# Response Template

This template defines how the CI agent should format its final response, which becomes the body of the GitHub PR.

Customize this template based on the task type and what information reviewers need.

---

## Example: Fix/Migration Task

```markdown
Finished processing N `<tool-name>` issues:
  - `resolved`: X
  - `ignored`: Y
  - `skipped`: Z

Details below:

---

## Issue 1
- **File(s)**: `path/to/file.ts`
- **Summary**: [concise description of the issue]
- **Resolution**: **FIXED**. [concise description of the fix]
- **Risk**: [HIGH / medium / low]
- **Manual verification** (for HIGH/medium risk): [steps to test the changes]

## Issue 2
- **File(s)**: `path/to/other.ts`
- **Summary**: [...]
- **Resolution**: **IGNORED**. [why the rule was added to ignore list]

## Issue 3
- **File(s)**: `path/to/another.ts`
- **Summary**: [...]
- **Resolution**: **SKIPPED**. [why this needs human attention]
```

---

## Example: Generation Task

```markdown
Generated N new <artifact type>:

| File | Description | Status |
|------|-------------|--------|
| `path/to/new-file.ts` | [what was generated] | Created |
| `path/to/updated.ts` | [what changed] | Updated |

## Validation
- Typecheck: PASS
- Tests: PASS
- Lint: PASS

## Notes
[Any context reviewers should know]
```

---

## Example: Refactor Task

```markdown
Refactored N components/modules:

## Changes

### `path/to/file.ts`
- **Before**: [brief description of old pattern]
- **After**: [brief description of new pattern]
- **Risk**: low

### `path/to/other.ts`
- **Before**: [...]
- **After**: [...]
- **Risk**: medium
- **Verify**: [how to test this change]

## Validation
- Typecheck: PASS
- Tests: PASS
- No behavior changes expected
```

---

## Template Variables

When writing your response template, you can use these placeholders:

- `<tool-name>` - The CLI tool or process that found issues
- `<artifact-type>` - What the agent creates (tests, types, docs, etc.)
- `<task-name>` - The name of the agent task
- `<date>` - Current date (MM/DD format)

## Guidelines

1. **Lead with summary stats** - Reviewers should know scope immediately
2. **Group by resolution type** - Fixed, ignored, skipped, or created
3. **Include risk levels and highlight prominently** - Help reviewers prioritize their review
4. **Provide verification steps** - For medium/high risk changes
5. **Keep it scannable and concise** - Use tables, headers, and bullet points. 
