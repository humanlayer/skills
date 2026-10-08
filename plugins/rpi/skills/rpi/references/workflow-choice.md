# Show the Workflow Choices

Show this plain-text chart with boxes and connecting lines when asking the user which flow to use:

```text
┌────────────────────┐      ┌──────────┐
│ Research questions │─────▶│ Research │
└────────────────────┘      └────┬─────┘
                                 │
       ┌─────────────────────────┘
       │
       │    ┌──────────────────────┐
       ├───▶│ 1. Design discussion │───┐
       │    └──────────────────────┘   │
       │    ┌────────┐    ┌─────┐      │
       ├───▶│ 2. PRD │───▶│ TDD │──────┤
       │    └────┬───┘    └─────┘      │
       │         └─────────────────────┤
       │    ┌────────┐                 │
       ├───▶│ 3. TDD │─────────────────┤
       │    └────────┘                 │    ┌────────────┐
       │                               ├───▶│  Outline   │
       │                               │    │ (optional) │
       │                               │    └─────┬──────┘
       │                               └──────────┤
       │                                          ▼
       │      4. Research only             ┌─────────────┐
       └──────────────────────────────────▶│  Implement  │
                                           └─────────────┘
```

Design discussion, PRD, and TDD can each lead to an outline or straight to implementation. A PRD can also lead to TDD. The user can start at any phase.

Briefly recommend a flow based on the request, then ask which they prefer. Use box-drawing glyphs, not Mermaid.

Include this note with the chart and recommendation:

> Implementation can start from any workflow step. If you decide that phase's document specifies the task well enough, just let me know and we can skip the rest of the workflow and get to building.
