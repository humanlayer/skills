# Iterate Research Questions

Refine an existing research-questions document using the user's feedback, or finish a partially written question set.

## Read the Questions and Feedback

Read the selected research-questions document in full, along with any feedback files the user names. Use the document selected by `/rpi` or the path the user supplies.

If the document is complete and the user supplied no feedback, ask what they want to change. For a partially finished document, continue from its existing scope.

## Refine the Questions

Check the feedback against the relevant source files and use lightweight research when needed. Use the research agents described in `$SKILLBASE/references/create-research-questions/SKILL.md` as useful.

Keep questions descriptive and focused on the current system: what exists, where it lives, how it behaves, and how its parts interact. Give the research agent concrete starting points and enough context to investigate objectively. Keep future design choices in the design phase.

Useful question shapes include:

- Explain how a feature works end to end and which systems take part.
- Explore a contract between two components and its implementation on both sides.
- Trace logic from an endpoint to its data store.
- Find the uses of a table or field and explain what the data supports.

Match the number and depth of questions to the task, usually two to seven. For frontend work, cover the existing component library, colors, typography, spacing, borders, shadows, and theming.

## Update the Document

Edit the existing document in place, weaving feedback into the questions and context pointers. Preserve its path, format, and frontmatter, updating the chosen flow when the user requests it. Keep exact paths, package names, repository names, and URLs intact, and add relevant pointers from the feedback.

## Hand Off to Research

Read `$SKILLBASE/references/iterate-research-questions/references/research_questions_final_answer.md` and respond using that template, filling in the saved file path, task directory, and chosen flow.
