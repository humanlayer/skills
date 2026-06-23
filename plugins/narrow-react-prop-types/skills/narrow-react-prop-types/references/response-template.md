# Response Template

Format your final response as GitHub-flavored markdown following this template. This response becomes the PR body.

---

## React Component Prop Narrowing Complete

### Summary

Narrowed props in **N** components.

### Changes Made

| Component | File | Change | Rationale |
|-----------|------|--------|-----------|
| `ComponentName` | `path/to/file.tsx` | Made `onAction` required | All live call sites provide it; menu item would be inert without handler |
| `ComponentName` | `path/to/file.tsx` | Removed `defaultItems` prop | No live call sites use it; only existed for Storybook |
| `ChildComponent` | `path/to/child.tsx` | Made `handler` required | Parent now always passes it after narrowing |

### Live Call Sites Checked

| Call Site | File | Observation |
|-----------|------|-------------|
| `ParentComponent` | `apps/app/src/Parent.tsx` | Always provides `onAction` and `items` |
| `AnotherParent` | `apps/app/src/Another.tsx` | Always provides `onAction`, omits `legacyProp` |

### Support Code Updated

- `ComponentName.stories.tsx`: Added required `onAction` handler to all stories
- `ComponentName.test.tsx`: Updated test fixtures to provide required props

### Validation

- [x] Typecheck passed (`bun run typecheck --filter <package>`)
- [x] Quality checks passed (`bun run quality`)

### Risk Assessment

- **Risk**: low
- **Reason**: All changes derived from live call site analysis; no behavior change expected

---

## Guidelines

1. **Lead with summary** - How many components were narrowed
2. **Be specific about changes** - Which props changed and why
3. **Show your work** - List the live call sites that justify each narrowing
4. **Note support code updates** - Stories/tests that needed updating
5. **Include validation results** - Confirm typecheck and quality passed
6. **Assess risk** - Help reviewers prioritize their review
