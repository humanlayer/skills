# Implement the Agreed Change

Implement from the outline when one exists, or directly from the available research and design documents. Use `outline-implementer-agent` for the code changes.

Follow these steps in order.

## 1. Read the Documents and Progress

Read the selected task directory's frontmatter-bearing workflow documents in full. Read referenced screenshots, HTML mockups, and diagrams when they help the work. Inspect repository instructions, current changes, and the relevant source files.

Use this precedence for implementation choices: outline > TDD > PRD > design discussion > research > original request. Follow the user's latest instructions when they change the agreed result.

With an outline, resume the first incomplete phase, using completed phase headings and checked validation items as the record of progress. Without an outline, use the available documents and implement the change in one run.

## 2. Delegate the Implementation

Launch `outline-implementer-agent` with a short prompt containing document paths, their precedence, and the phase or scope to implement. Let it read the documents itself.

With an outline, assign the next phase by default, including its phase number and review timing. Assign a group or all phases when the user requests that scope. For direct implementation, ask it to complete the whole change from the supplied documents. When subagents are unavailable, use the fallback instructions in the main skill.

## 3. Verify and Record Progress

Review the agent's result and verification evidence. Fix failed checks before marking them passed. In an outline, check automated validation items as they pass. Check manual items when the user confirms them, then mark the overview item and phase heading complete with `✅` once all validation is confirmed.

Continue to the next phase once automated checks pass and no manual checks remain. Pause for pending manual checks by default. Follow a request to run a group or all phases continuously, verifying between phases and leaving unconfirmed manual checks pending for the final review.

If code and design differ in a way that changes the agreed result, present the mismatch and ask the user to settle the approach.

## 4. Report the Current Result

Summarize what changed, checks run, and any manual verification needed. For a phase pause, state the next phase and wait for the user's test results or request to continue.

When a workflow document was updated, offer to open it for review in VS Code, Cursor, or the user's preferred editor or browser.

Make commits when requested, following repository rules. Keep artifact progress in its existing document.

## 5. Continue the Requested Scope

For each next outline phase within the requested scope, launch the implementer with its document paths and verify the result. When all requested work is done, read `$SKILLBASE/references/implement-outline/references/implement_outline_final_answer.md` and use it to report completion or pending validation.
