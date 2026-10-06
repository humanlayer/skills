# Research the Current System

Answer the research questions with facts from live code, tests, and available documentation. Explain what exists, how it works, and how its parts interact. Keep future design choices for the design phase.

Follow these steps in order.

## 1. Read the Research Scope

Use either a research-questions document or a direct question, such as `/rpi create research for how the electric collections connect to tanstack`. A direct question starts research immediately and produces one document answering that question. Match the depth to the question.

When using a research-questions document, read it in full in the main context before delegating and use it as the task context. For a direct request, use the user's question and named sources. Read the source files and documentation those inputs point to. Ask for a research question when neither is available.

Carry the chosen flow from the question document or invocation into the handoff when one exists. A standalone research answer finishes with the saved document and an invitation for follow-up questions.

## 2. Break the Questions into Research Areas

Group related questions into focused areas. Usually use two to six subagents, adapting to the scope:

Identify the components, directories, patterns, and dependencies each investigation covers. Track the investigations so every question gets an answer.

## 3. Investigate with Subagents

- `codebase-locator` finds relevant code, configuration, and tests.
- `codebase-analyzer` traces behavior, data flow, and component interactions.
- `codebase-pattern-finder` finds existing examples and conventions.
- `web-search-researcher` checks external sources and returns links with its findings.

Use an Explore agent when useful. Start with locating code where needed, then analyze the relevant implementations. Run independent investigations in parallel. Give each agent a bounded, read-only question and ask for concrete paths, line references, testing patterns, and supporting evidence.

Use available web or library-documentation tools for dependency questions. When web access is unavailable, note that limit and continue with code and local documentation.

## 4. Wait for Results and Synthesize the Findings

Wait for all investigations to finish before synthesizing. Check the evidence, resolve conflicting findings against live code, and connect results across components. Answer each research question with concrete evidence and verify the cited paths.

## 5. Gather Metadata and Read the Document Template

Gather the current date and an identifier and commit SHA for each repository researched. Use `repos: []` when none apply. Select the next available `NN-` number in the task directory and a short description for `NN-research-<description>.md`.

Now that the research is complete, read `$SKILLBASE/references/create-research/references/research_template.md`.

Read the vendored `/show-me` instructions at `$SKILLBASE/references/show-me.md` for the visual explanations in the document. Use its current-state views to show the system as it exists today.

## 6. Write the Research Document

Use the template to write a self-contained technical explanation organized around how the system works. Give findings sections headers that assert what is true. A reader should understand the main findings by skimming the headers alone.

For example, use "Workers restore pending jobs before accepting new work" rather than "Worker startup" or "How do workers restore jobs?" Lead with the finding, then support it with explanation, citations, and visuals. Organize sections by concept and describe what each part does before citing where it lives.

Use Mermaid diagrams, tables, call trees, component trees, contracts, signatures, and pseudocode where they make the structure clearer. Place each view beside the prose it supports. Keep the technical depth needed to answer every research question.

For each component, describe its current tests: file locations, unit/integration/end-to-end coverage, fixtures, mocks, and utilities. State when you found no tests. Include external source links and a grouped code-reference list with enough coverage to navigate the researched area.

Save the document at the selected path with the gathered metadata. Include `flow` in the frontmatter when a workflow was chosen.

## 7. Investigate Remaining Open Questions

If questions remain, do one targeted follow-up investigation and weave its findings into the relevant sections. Keep any remaining uncertainty explicit in the document.

## 8. Read the Final-Answer Template and Respond

Read `$SKILLBASE/references/workflow.md` to select the next step, then read `$SKILLBASE/references/create-research/references/research_final_answer.md` and respond using that template. Fill in the research path, next step, task directory, and chosen flow. Mention remaining open questions when present.

For standalone research, use the saved-document and review portions of the template as the complete response.

## 9. Handle Follow-Up Research

For follow-up requests, investigate as needed, verify the new findings, and weave them into the existing document in place.
