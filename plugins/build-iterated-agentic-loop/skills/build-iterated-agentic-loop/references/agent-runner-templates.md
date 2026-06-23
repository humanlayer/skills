# Agent Runner Templates

Use one of these inside the workflow's agent run step. Broad permission modes are appropriate only on trusted, isolated runners.

Each agent outputs differently, so response extraction varies. The goal is to get the agent's final formatted response into `/tmp/pr-body.md` for the PR body.

---

## Claude Code

Secret: `ANTHROPIC_API_KEY`.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 24
- run: npm install -g @anthropic-ai/claude-code
- name: Run Claude Code
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    claude -p "$PROMPT" \
      --permission-mode bypassPermissions \
      --output-format stream-json \
      --verbose \
      2>&1 | tee /tmp/agent-output.txt
```

Use `--max-turns` or `--max-budget-usd` when the repo needs spend guards.

**Response extraction:** Claude Code with `--output-format stream-json` outputs JSON lines. Extract the final assistant message:

```yaml
- name: Extract PR body
  run: |
    # Extract the last assistant text message from stream-json output
    cat /tmp/agent-output.txt \
      | grep '^{' \
      | jq -s '[.[] | select(.type == "assistant" and .message.content)] | last | .message.content[] | select(.type == "text") | .text' -r \
      > /tmp/pr-body.md
```

---

## Codex CLI

Secret: `OPENAI_API_KEY`.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 24
- run: npm install -g @openai/codex
- name: Login Codex
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: printenv OPENAI_API_KEY | codex login --with-api-key
- name: Run Codex
  run: |
    codex exec "$PROMPT" \
      --cd "$GITHUB_WORKSPACE" \
      --ask-for-approval never \
      --sandbox danger-full-access \
      --json \
      --output-last-message /tmp/pr-body.md \
      2>&1 | tee /tmp/agent-output.txt
```

**Response extraction:** Codex has built-in support via `--output-last-message /tmp/pr-body.md`. No additional extraction needed.

---

## OpenCode

Secret: provider-specific, commonly `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`.

```yaml
- uses: oven-sh/setup-bun@v2
- run: bun install -g opencode-ai
- name: Run OpenCode
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    opencode run "$PROMPT" \
      --dir "$GITHUB_WORKSPACE" \
      --model anthropic/claude-sonnet-4-5 \
      --format json \
      --dangerously-skip-permissions \
      2>&1 | tee /tmp/agent-output.txt
```

Change `--model` and env secrets together, for example to an `openai/...` model with `OPENAI_API_KEY`.

**Response extraction:** OpenCode with `--format json` outputs structured JSON. Extract the final message:

```yaml
- name: Extract PR body
  run: |
    # Extract the last assistant message from OpenCode JSON output
    cat /tmp/agent-output.txt \
      | jq -r '.messages | map(select(.role == "assistant")) | last | .content' \
      > /tmp/pr-body.md
```

---

## CodeLayer

Secret: usually `ANTHROPIC_API_KEY` for Anthropic-backed runs.

```yaml
- uses: oven-sh/setup-bun@v2
- name: Run CodeLayer
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    FORCE_COLOR: "3"
  run: |
    bunx @humanlayer/cli@latest codelayer \
      --provider anthropic \
      --model claude-opus-4-8 \
      --thinking high \
      --prompt "$PROMPT" \
      2>&1 | tee /tmp/agent-output.txt
```

Use this when the repo already depends on HumanLayer/CodeLayer conventions or wants CodeLayer's PR-oriented behavior.

**Response extraction:** CodeLayer outputs plain text with ANSI colors. Use a parser script or strip formatting:

```yaml
- name: Extract PR body
  run: |
    # If you have a codelayer-output parser script:
    # bun ci-scripts/codelayer-output.ts < /tmp/agent-output.txt > /tmp/pr-body.md
    
    # Otherwise, strip ANSI codes and use the raw output:
    cat /tmp/agent-output.txt | sed 's/\x1b\[[0-9;]*m//g' > /tmp/pr-body.md
```

For cleaner extraction, use a parser script like `ci-scripts/codelayer-output.ts` that extracts just the final response section.

---

## Notes

- All agents should tee output to `/tmp/agent-output.txt` for artifact upload and debugging.
- The extracted response goes to `/tmp/pr-body.md` which is used by the PR creation step.
- If extraction fails, the workflow should fall back gracefully (e.g., use raw output or a placeholder message).
