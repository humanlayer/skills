# Iterate a Product Requirements Document

Revise an existing PRD from feedback or resume the product interview. Work through one resolved choice at a time in the main conversation.

Follow these steps in order.

## 1. Read the PRD and Context

Read the selected PRD, related workflow documents, and named sources in full. Read linked mockups when they affect the current decision. Identify the problem, success measure, agreed solution, and parts still unfinished.

## 2. Choose the Next Product Question

Use the user's feedback or requested interview direction. For unfinished work, continue with the next unsettled product choice. For a complete PRD with no feedback, offer a choice between revising it and exploring further product questions.

Keep the interview about user experience, functionality, and behavior. Record implementation questions under **Deferred to TDD**.

## 3. Verify the Context Needed for the Decision

Check factual claims against relevant code and docs. Use the research agents when useful and wait for their findings before presenting options. Add new facts to the research document when present.

## 4. Read the Templates and Visual Guidance

Read `$SKILLBASE/references/iterate-prd/references/prd_template.md` and `$SKILLBASE/references/show-me.md`.

## 5. Settle the Decision and Rework the PRD

Ask one question per message, presenting options, tradeoffs, and a recommendation when useful. Work through clarifications until the user settles the decision.

Then edit the PRD in place, reworking affected sections so the spec describes the current agreed solution. Keep its original path and metadata, updating `repos` as needed. Reflect changes in the problem, success, solution, alternatives, and scope where relevant.

Use headers that state the main point and keep paragraphs short. For visual decisions, update the focused HTML mockups and their local links beside the explanation.

If the user asked to continue the interview, present the next unsettled choice. After applying specific feedback, hand control back to the user for the next change.

## 6. Review and Hand Off

Offer to open the document for review in VS Code, Cursor, or the user's preferred editor or browser.

When the solution is ready, ask the user to review **Solution Details** as a whole and approve it. After approval, read `$SKILLBASE/references/iterate-prd/references/prd_final_answer_resolved.md` and use it for the handoff to TDD, an outline, or direct implementation.
