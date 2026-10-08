# Create a Product Requirements Document

Work with the user to define what they want to build and why: the problem, success measure, user experience, functionality, and behavior. Keep implementation questions for the TDD.

Follow these steps in order, running the interview in the main conversation.

## 1. Read the Available Context

Read the task directory's workflow documents and named sources in full. Work from the inputs present, whether that is research, a design discussion, or a short request. Reference upstream documents for facts and surface missing product context as questions.

When the conversation depends on current code behavior, use the research agents to establish it. Wait for the results and update the research document when one exists.

For UI work, use the research's design-system findings. Investigate components, colors, typography, spacing, and theming when more context is needed for mockups.

## 2. Read the Templates and Write a Small Starting Document

Read `$SKILLBASE/references/create-prd/references/prd_template.md` and `$SKILLBASE/references/show-me.md`.

Write `NN-prd-<description>.md` using the next available number. Start with frontmatter, the title, a first-draft **Problem to Solve**, and empty **Success**, **Proposed Solution**, and **Solution Details** sections. Fill `repos` with the relevant identifiers and SHAs, or use `repos: []`.

Quote the drafted problem statement and ask the user one question to confirm or correct it. Keep this opening short so the interview starts promptly.

## 3. Settle the Problem and Success Measure

First agree on the problem. Rework its section once the user settles the wording.

Then discuss how to tell whether the change helps users after it ships. Propose a measure suited to the work: adoption, a benchmark, errors, latency, or a qualitative result. For small work with no useful measure, record that choice with the user's agreement.

Ask one question per message and wait for the answer. Once the problem and success measure are settled, open the solution interview.

## 4. Interview the User About the Solution

Present one product decision at a time with two or three options, tradeoffs, and a recommendation. Give the user time to answer and clarify the choice. Update the document once the decision is settled.

Rework the affected sections into a coherent spec: update **Solution Details**, refine **Proposed Solution**, and record alternatives and scope when they change. Use short paragraphs and section headers that state the result, such as "Reviewers comment without signing in."

For UI choices, save focused `mockup-<description>.html` files in the task directory. Match the user's product, use realistic labels, and link each mockup beside its explanation in the document and conversation. Update mockups as decisions change.

For technical questions about schemas, storage, or code structure, record them under **Deferred to TDD** and return to product behavior.

## 5. Ask the User to Review the Whole Solution

When the solution is filled out, ask the user to read **Solution Details** from start to finish and approve it as a whole. Incorporate their fixes and keep the document and mockups current.

Offer to open the document for review in VS Code, Cursor, or the user's preferred editor or browser.

## 6. Read the Final-Answer Template and Respond

After approval, read `$SKILLBASE/references/create-prd/references/prd_final_answer_resolved.md` and use it for the handoff. TDD is the usual next step; the user can also choose an outline or direct implementation.
