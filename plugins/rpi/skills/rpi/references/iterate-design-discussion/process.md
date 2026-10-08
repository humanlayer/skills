# Iterate a Design Discussion

Apply feedback to an existing design discussion or resume its open choices. Keep the document a coherent description of the agreed design.

Follow these steps in order.

## 1. Read the Discussion and Context

Read the selected discussion, relevant workflow documents, and named files in full in the main conversation. Read supporting resources as needed. Identify the choices already settled and those still open.

## 2. Establish the Next Decision

Use the user's feedback as the starting point. When resuming unfinished work, pick the open choice that most affects the rest of the design. For a finished discussion with no feedback, ask whether the user wants to change a choice or explore the design further.

## 3. Verify Facts That Affect the Choice

Read the relevant source and use the research agents when useful to check current behavior and existing patterns. Wait for their findings. Record new facts in the research document when present.

## 4. Read the Document Template and Visual Guidance

Read `$SKILLBASE/references/iterate-design-discussion/references/design_discussion_template.md` and `$SKILLBASE/references/show-me.md` before revising the discussion.

## 5. Settle One Choice and Update the Document

Treat an explicit choice in the user's feedback as settled. For a choice that still needs an answer, present its options, tradeoffs, and a recommendation, then wait. Keep clarifying exchanges in the conversation until the choice is settled.

Update the existing file in place. Rework the current state, desired state, architecture, patterns, and scope as the decision requires. Move answered choices into **Resolved Design Questions** with rationale and alternatives considered. Keep new choices open for the user.

Use headers that state the section's main point. Update diagrams and any linked HTML mockups beside the prose they support. Preserve document metadata and update the `repos` list when the researched repositories change.

## 6. Continue the Interview or Hand Off

Offer to open the document for review in VS Code, Cursor, or the user's preferred editor or browser.

While choices remain, read `$SKILLBASE/references/iterate-design-discussion/references/design_discussion_final_answer.md` and present the next question when the user wants to continue.

When the user has settled every design choice, read `$SKILLBASE/references/iterate-design-discussion/references/design_discussion_final_answer_resolved.md` and suggest an outline or direct implementation.

For a requested early handoff, save agreed decisions and remaining open choices, then follow the requested step.
