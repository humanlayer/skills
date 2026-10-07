# Iterate a Technical Design Document

Revise an existing TDD from feedback or resume its system and program design interviews. Keep the two concerns distinct and resolve one choice at a time in the main conversation.

Follow these steps in order.

## 1. Read the TDD and Context

Read the selected TDD, relevant workflow documents, and named sources in full. Read supporting resources as needed. Identify the settled system and program choices and any recorded approvals.

## 2. Establish the Next Technical Decision

Use the user's feedback or resume unfinished design. For a finished TDD with no feedback, offer a choice between revising it and exploring further technical questions.

For a resumed interview, settle and get approval of system design before opening program design. Existing feedback can revise either section; changes to the architecture may also require the code shape to change.

## 3. Verify Current Behavior and Patterns

Read relevant code and use `codebase-locator`, `codebase-analyzer`, and `codebase-pattern-finder` where useful. Use external research when relevant. Wait for findings and add new facts to the research document when present.

## 4. Read the Templates and Visual Guidance

Read `$SKILLBASE/references/iterate-tdd/references/tdd_template.md` and `$SKILLBASE/references/show-me.md`.

## 5. Settle the Choice and Update the TDD

Present one decision with options, tradeoffs, and a recommendation. For system choices, show diagrams or contracts across components. For program choices, show concrete code-shape options in separate code blocks. Wait for the user to settle the choice before editing.

Rework the affected sections in place, expressing current behavior and the proposed change within **System Design** and the in-code structure within **Program Design**. Preserve the path and metadata, updating `repos` as needed.

Use headers that state the finding or agreed behavior, short paragraphs, and visuals beside their explanations. Keep linked HTML diagrams and patterns current. With the user's agreement, update the PRD and mockups when technical choices change product behavior.

## 6. Continue or Review the Design

At each section review, offer to open the document in VS Code, Cursor, or the user's preferred editor or browser.

For a continuing interview, ask the next unresolved question. After a specific feedback change, hand control back to the user. Get approval for system design and then program design when finishing or revising those designs.

## 7. Read the Final-Answer Template and Respond

After the design is approved, read `$SKILLBASE/references/iterate-tdd/references/tdd_final_answer_resolved.md` and offer an outline or direct implementation.
