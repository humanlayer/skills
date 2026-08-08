# skills

Claude Code skills from [HumanLayer](https://humanlayer.dev).

## Installation

```bash
npx skills add humanlayer/skills --skill SKILLNAME
```

## Available Skills

### improve-claude-md

Rewrites your CLAUDE.md using `<important if>` blocks to improve instruction adherence.

```bash
npx skills add humanlayer/skills --skill improve-claude-md
```

Then in your project:

```
/improve-claude-md
```

### run-ec2-daemon

Creates and checks an exploratory HumanLayer daemon host on EC2 with explicit network and security choices.

```bash
npx skills add humanlayer/skills --skill run-ec2-daemon
```

Then ask Claude to run an EC2 daemon or invoke:

```text
/run-ec2-daemon
```
