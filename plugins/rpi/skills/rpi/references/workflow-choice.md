# Show the Workflow Choices

Show this small ASCII chart when asking the user which flow to use:

```text
Research questions -> Research
                         |
                         +-> 1. Design discussion -> [Outline] -> Implement
                         +-> 2. PRD -> TDD --------> [Outline] -> Implement
                         +-> 3. TDD ---------------> [Outline] -> Implement
                         +-> 4. Research only ----------------> Implement
```

`[Outline]` is optional. The user can also skip design steps or start at a later phase.

Briefly recommend a flow based on the request, then ask which they prefer. Use plain ASCII, not Mermaid.
