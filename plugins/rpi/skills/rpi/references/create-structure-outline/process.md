# Create a Structure Outline

Turn the agreed design into ordered implementation phases that can each be tested. Describe intent and code shape at the level needed to review the work.

Follow these steps in order.

## 1. Read the Workflow Documents

Read the completed research, design documents, original request, and named sources in full in the main context. Use the documents available. Review settled decisions, desired behavior, scope, and patterns to follow.

## 2. Read Relevant Code and Fill Gaps

Read the source files cited by the documents and check the project's test and verification commands. Use the research agents for remaining questions and wait for their results before writing the outline.

## 3. Read the Visual Guidance and Document Template

Read `$SKILLBASE/references/show-me.md` and `$SKILLBASE/references/create-structure-outline/references/structure_outline_template.md`.

## 4. Divide the Work into Testable Phases

Prefer small end-to-end results that cross the relevant module or service boundaries. Each phase should work and be verifiable when it ends. For example, first serve a simple result end to end, then add editing, then an error path, each with its tests.

Adapt this approach to the actual work. Some changes are best as one phase; others need a safe preparatory step. Order phases so their checks can run with the work completed so far.

For each phase, describe:

- The result the phase delivers and why it comes next.
- A compact change outline: relevant files, ownership, data structures, contracts, and behavior.
- Tests following the project's existing patterns.
- Runnable automated checks and any checks that need human judgment.

Choose and order the visual views for the phase. A contract or data shape may explain the work better than starting with a file tree. Put short explanations between views. Use focused diffs for existing shapes and full target shapes for new code. Use the tree format from `/show-me` when file ownership matters.

## 5. Write the Outline

Write `NN-structure-outline-<description>.md` in the selected task directory using the next available number. Include the relevant `repos` identifiers and SHAs, or `repos: []`.

Add an **Implementation Overview** with an unchecked item for each phase title. Give every phase its result, **Change Outline**, and **Validation**. Separate **Automated Verification** from **Manual Verification**, including manual checks when they need human judgment. Use the repository's actual commands.

Record unresolved scope or phase questions under **Open Questions**. Use clear phase titles and short explanations that let a person review the proposed changes.

## 6. Apply Outline Feedback

Verify any factual corrections, then revise the outline in place. Treat scope, ordering, or validation feedback as changes to this document. Incorporate settled answers into the relevant sections and keep the overview synchronized with the phases.

## 7. Read the Final-Answer Template and Respond

Read `$SKILLBASE/references/create-structure-outline/references/structure_outline_final_answer.md` and provide the document path and suggested implementation command for the user's next session.

Offer to open the document for review in VS Code, Cursor, or the user's preferred editor or browser.
