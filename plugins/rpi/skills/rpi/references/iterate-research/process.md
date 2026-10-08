# Iterate Research

Correct or extend an existing research document using the user's feedback, or resume a partially finished investigation. Explain the system as it exists today, with evidence from code, tests, and available documentation.

Follow these steps in order.

## 1. Read the Research and Feedback

Read the selected research document in full in the main context before delegating. Use the research document and the user's feedback as the whole task context. Read the current-system source files or documentation they name in full. Load the original request and desired-state design documents in design and implementation sessions. Select an actual research report when locating the document; research questions are a separate document type.

For a complete document with no feedback, ask what the user wants to investigate or change. For unfinished research, continue from the recorded scope and open questions.

## 2. Identify What Needs Another Look

Check which findings the feedback affects, which questions remain unanswered, and what evidence is needed. Group related investigations into focused areas. Keep questions about current behavior and interactions, with future design choices in the design phase.

## 3. Conduct Additional Research

Use the appropriate agents for each investigation:

- `codebase-locator` finds relevant source files, configuration, and tests.
- `codebase-analyzer` traces behavior, data flow, and component interactions.
- `codebase-pattern-finder` finds existing examples and conventions.
- `web-search-researcher` checks external sources when the user requests web research and returns links with its findings.

Use an Explore agent when useful. Locate code first where needed, then analyze the relevant implementations. Run independent investigations in parallel. Give each agent a focused, read-only task and ask for paths, line references, testing patterns, and supporting evidence.

Use available web or library-documentation tools for external questions. When web access is unavailable, note that limit and continue with code and local documentation.

## 4. Wait for Results and Verify the Findings

Wait for every investigation to finish. Check the evidence against live code, resolve conflicting results, and connect findings across components. Include external links when used. Keep remaining uncertainty explicit.

## 5. Read the Document Template and Visual Guidance

Read `$SKILLBASE/references/iterate-research/references/research_template.md` for the document structure, then read `$SKILLBASE/references/show-me.md` for visual explanations. Use current-state views to show how the system works today.

## 6. Update the Document in Place

Weave verified findings into the affected sections at the existing path. Rework those sections so the document reads as one coherent technical explanation. Preserve its frontmatter and update repository entries or status as needed. Record repositories as zero or more `repos` entries with `identifier` and `sha`, using `repos: []` when none apply.

Give each findings section a header that states what is true. A reader should understand the main findings by skimming the headers alone. For example, use "Sessions persist before the daemon acknowledges the write" rather than "Session storage" or "How are sessions persisted?" Refresh affected headers in this style.

Explain each concept before citing where it lives. Support claims with file and line references, and keep the technical depth needed to answer the research scope. Place diagrams, tables, signatures, contracts, trees, and pseudocode beside the prose they explain.

For each affected component, update its testing patterns: test locations, approaches, fixtures, mocks, and utilities. State when no tests were found. Keep the summary, code-reference list, architecture documentation, and open questions in step with the findings.

Distinguish tests read from checks run. Support claims that a check passed with its command and observed result.

## 7. Read the Final-Answer Template and Respond

Read `$SKILLBASE/references/iterate-research/references/research_final_answer.md` and respond using that template. For a chosen workflow, use `$SKILLBASE/references/workflow.md` to suggest the next step with the task directory and flow. For standalone research, use the saved-document and review portions as the complete response.

Offer to open the document for review in VS Code, Cursor, or the user's preferred editor or browser.
