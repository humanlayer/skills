# Iterate a Structure Outline

Revise the phase order, scope, code shapes, and checks of an existing outline, or finish a partially written outline.

Follow these steps in order.

## 1. Read the Outline and Context

Read the selected outline, relevant workflow documents, and named files in full. Understand the agreed behavior, existing progress markers, and the user's feedback.

For a finished outline with no feedback, ask what the user wants to revise. For an unfinished outline, resume its remaining scope and questions.

## 2. Verify the Affected Code and Commands

Check the feedback against source files and existing tests. Use the research agents for gaps and wait for their results. Confirm the repository's verification commands before changing validation.

## 3. Read the Templates and Visual Guidance

Read `$SKILLBASE/references/iterate-structure-outline/references/structure_outline_template.md` and `$SKILLBASE/references/show-me.md`.

## 4. Rework the Phases

Reorganize the work into independently testable results, crossing relevant module boundaries where useful. Each phase's checks should work with the code completed by that point. Include code shapes, ownership, test changes, and enough explanation to review each result.

Apply scope and ordering feedback to the phases and overview together. Incorporate answered questions into the relevant sections. Preserve valid completion markers for work already verified, and identify checks that need another run when scope changes.

## 5. Update the Outline in Place

Keep the existing path and metadata, updating the `repos` list as needed. Use concise descriptions, focused visual views, and actual automated checks. Include manual verification when it requires user judgment. Keep the overview synchronized with the phase titles.

Treat outline feedback as a request to update the outline. A request to implement moves to the implementation process.

## 6. Read the Final-Answer Template and Respond

Read `$SKILLBASE/references/iterate-structure-outline/references/structure_outline_final_answer.md` and provide the updated file path and next command.

Offer to open the document for review in VS Code, Cursor, or the user's preferred editor or browser.
