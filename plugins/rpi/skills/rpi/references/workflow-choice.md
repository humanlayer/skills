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
