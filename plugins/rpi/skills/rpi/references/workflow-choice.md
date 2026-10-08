# Show the Workflow Choices

Show this ASCII chart with boxes and connecting lines when asking the user which flow to use:

```text
+--------------------+      +----------+
| Research questions |----->| Research |
+--------------------+      +----+-----+
                                 |
       +-------------------------+
       |
       |    +----------------------+
       +--->| 1. Design discussion |---+
       |    +----------------------+   |
       |    +--------+    +-----+      |    +------------+
       +--->| 2. PRD |--->| TDD |------+--->|  Outline   |
       |    +--------+    +-----+      |    | (optional) |
       |    +--------+                 |    +-----+------+
       +--->| 3. TDD |-----------------+          |
       |    +--------+                            v
       |                                   +-------------+
       |    +------------------+           |  Implement  |
       +--->| 4. Research only |---------->|             |
            +------------------+           +-------------+
```

The outline is optional. The user can also skip design steps or start at a later phase.

Briefly recommend a flow based on the request, then ask which they prefer. Use plain ASCII, not Mermaid.
