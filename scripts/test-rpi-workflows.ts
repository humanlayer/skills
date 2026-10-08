import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir, tmpdir } from 'node:os'

const source = resolve(import.meta.dir, '../plugins/rpi/skills/rpi')
const runRoot = mkdtempSync(join(tmpdir(), 'rpi-workflows-'))
const results: { name: string, status: string, detail?: string }[] = []
const selected = process.argv.slice(2)
console.log(`Test fixtures and transcripts: ${runRoot}`)

async function shell(cwd: string, args: string[]) {
  const process = Bun.spawn(args, { cwd, stdout: 'pipe', stderr: 'pipe', env: {
    ...Bun.env,
    GIT_AUTHOR_NAME: 'RPI Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
    GIT_COMMITTER_NAME: 'RPI Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
  } })
  const stdout = new Response(process.stdout).text()
  const stderr = new Response(process.stderr).text()
  const code = await process.exited
  const out = await stdout
  const err = await stderr
  assert.equal(code, 0, `${args.join(' ')}: ${err}`)
  return out.trim()
}

async function fixture(name: string, branch = 'feature/retry', git = true, installSkill = true) {
  const cwd = join(runRoot, name)
  mkdirSync(join(cwd, '.agents/skills'), { recursive: true })
  if (installSkill) symlinkSync(source, join(cwd, '.agents/skills/rpi'), 'dir')
  mkdirSync(join(cwd, 'src'))
  writeFileSync(join(cwd, 'src/retry.js'), 'export function retryDelay(attempt, base = 100) { return base * (attempt + 1) }\n')
  writeFileSync(join(cwd, 'src/retry.test.js'), "import { test, expect } from 'bun:test'\nimport { retryDelay } from './retry.js'\ntest('delay grows linearly', () => { expect(retryDelay(2)).toBe(300) })\n")
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name: 'retry-fixture', type: 'module', scripts: { test: 'bun test' } }))
  writeFileSync(join(cwd, 'README.md'), '# Retry utility\nThe current delay is linear. Run `bun test` for tests.\n')
  writeFileSync(join(cwd, '.gitignore'), '.agents/skills/\n')
  if (git) {
    await shell(cwd, ['git', 'init', '-b', branch])
    await shell(cwd, ['git', 'add', 'src', 'package.json', 'README.md', '.gitignore'])
    await shell(cwd, ['git', 'commit', '-m', 'initial test fixture'])
  }
  return cwd
}

function artifact(cwd: string, name: string, content: string, directory = '.agents/artifacts/feature-retry') {
  mkdirSync(join(cwd, directory), { recursive: true })
  writeFileSync(join(cwd, directory, name), content)
}
const doc = (type: string, body: string, extra = '') => `---\ntype: ${type}\nrepos: []\n${extra}---\n\n${body}\n`
const questions = doc('research-questions', '# Research Questions\n\n## Questions\n1. How is retry delay computed in src/retry.js?\n2. How is this behavior tested?', 'flow: tdd\n')
const research = doc('research', '# Research: retry\n\n## Summary\nretryDelay uses base * (attempt + 1).\n\n## Detailed Findings\n### Delay grows linearly\nSee src/retry.js:1.\n\n## Open Questions\nNone.', 'status: complete\nflow: tdd\n')
const request = doc('request', '# Request\nChange retryDelay to capped exponential delay: base * 2 ** attempt, capped at 1000. Preserve the existing function signature.')
const draftDiscussion = doc('design-discussion', `# Retry Design Discussion
## Current Experience
retryDelay returns base * (attempt + 1), without a maximum.
## Desired Experience
Return capped exponential delays, preserving the function signature.
## Architecture
Keep the existing synchronous helper and Bun unit tests. Use base * 2 ** attempt.
## Design Questions
### Choose the maximum delay
Options: 1000 (recommended) or 2000. A lower maximum bounds waits sooner.
### Choose whether to add jitter
Options: no jitter (recommended, keeps results deterministic) or random jitter.
## Resolved Design Questions
### Preserve the signature and use doubling
The user chose base * 2 ** attempt and the existing signature. Linear growth was set aside because it grows too slowly.
## Scope
Change the helper and tests. No retry scheduler.`, 'status: draft\n')
const outline = doc('structure-outline', `# Retry Outline
## Desired End State
Capped exponential delay, preserving the function signature.
## Implementation Overview
- [ ] Phase 1: Exponential delay
- [ ] Phase 2: Cap delay at 1000
## Phase 1: Exponential delay
Change retryDelay to base * 2 ** attempt. Add tests.
### Validation
#### Automated Verification
- [ ] bun test
#### Manual Verification
- [ ] User reviews the exponential delay behavior.
## Phase 2: Cap delay at 1000
Cap delay at 1000 and add tests.
### Validation
#### Automated Verification
- [ ] bun test
#### Manual Verification
- [ ] User reviews the capped delay behavior.
## Open Questions
None.`)

async function turn(cwd: string, prompt: string, label: string, thread?: string, artifactWrites = true, delegation?: boolean, loadSkillByPath = false) {
  const logs = join(runRoot, 'logs', cwd.split('/').at(-1)!)
  mkdirSync(logs, { recursive: true })
  const log = join(logs, `${label}.jsonl`)
  const answer = join(logs, `${label}.answer.txt`)
  const stderr = join(logs, `${label}.stderr.txt`)
  const args = ['codex', 'exec', '--ignore-user-config', '-c', 'approval_policy="never"',
    '-c', 'default_permissions="rpi-tests"',
    '-c', 'permissions.rpi-tests.extends=":workspace"',
    '-c', 'model_reasoning_effort="medium"',
    '--skip-git-repo-check', '--json', '-o', answer]
  if (artifactWrites) args.push('-c', 'permissions.rpi-tests.filesystem={":workspace_roots"={".agents/artifacts"="write"}}')
  if (delegation !== undefined) args.push(delegation ? '--enable' : '--disable', 'multi_agent')
  if (thread) args.push('resume', thread)
  else args.push('-C', cwd)
  args.push(loadSkillByPath ? `Use the rpi skill at ${join(source, 'SKILL.md')}.\n${prompt}` : `$rpi\n${prompt}`)
  const head = await shell(cwd, ['git', 'rev-parse', 'HEAD']).catch(() => null)
  const process = Bun.spawn(args, { cwd, stdin: 'ignore', stdout: Bun.file(log), stderr: Bun.file(stderr) })
  const timeout = setTimeout(() => process.kill(), 600_000)
  const code = await process.exited
  clearTimeout(timeout)
  const events = readFileSync(log, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
  const started = events.find(event => event.type === 'thread.started')
  const text = existsSync(answer) ? readFileSync(answer, 'utf8') : ''
  assert.equal(code, 0, `${label}: Codex failed; see ${log}`)
  assert.ok(text.trim(), `${label}: empty response`)
  assert.ok(!readFileSync(stderr, 'utf8').includes(`failed to load skill ${source}/`), 'Internal phases were discovered as broken installed skills')
  if (head) assert.equal(await shell(cwd, ['git', 'rev-parse', 'HEAD']), head, 'Workflow committed without a user request')
  console.log(`${label}: ${text.slice(0, 180).replaceAll('\n', ' ')}`)
  const messages = events.filter(event => event.item?.type === 'agent_message').map(event => event.item.text).join('\n')
  return { text, messages, thread: started?.thread_id || thread, events }
}

function sessionEvents(thread: string) {
  const sessions = join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'sessions')
  for (const offset of [0, -86_400_000]) {
    const date = new Date(Date.now() + offset)
    const directory = join(sessions, String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0'))
    if (!existsSync(directory)) continue
    const name = readdirSync(directory).find(name => name.endsWith(`${thread}.jsonl`))
    if (!name) continue
    return readFileSync(join(directory, name), 'utf8').split('\n').filter(Boolean)
      .map(line => JSON.parse(line))
  }
  throw new Error(`No raw Codex transcript found for ${thread}`)
}

function sessionToolCalls(thread: string): string[] {
  return sessionEvents(thread)
    .filter(event => event.type === 'response_item' && event.payload.type === 'function_call')
    .map(event => event.payload.name)
}

function documents(cwd: string, dir = '.agents/artifacts/feature-retry') {
  const path = join(cwd, dir)
  return existsSync(path) ? readdirSync(path).filter(name => name.endsWith('.md')) : []
}
function report(cwd: string, pattern: string, directory?: string) {
  const names = documents(cwd, directory).filter(name => {
    if (!name.includes(pattern)) return false
    if (pattern !== '-research-') return true
    const path = join(cwd, directory || '.agents/artifacts/feature-retry', name)
    const metadata = Bun.YAML.parse(readFileSync(path, 'utf8').split('---')[1]) as Record<string, unknown>
    return metadata.type === 'research'
  })
  assert.equal(names.length, 1, `Expected one ${pattern} document: ${names}`)
  const path = join(cwd, directory || '.agents/artifacts/feature-retry', names[0])
  const text = readFileSync(path, 'utf8')
  const metadata = Bun.YAML.parse(text.split('---')[1]) as Record<string, unknown>
  assert.ok(Array.isArray(metadata.repos), `Missing repos in ${path}`)
  assert.ok(!('git_commit' in metadata) && !('repository' in metadata))
  return { path, text, metadata }
}

async function test(name: string, fn: () => Promise<void>) {
  if (selected.length && !selected.includes(name)) return
  console.log(`\nTEST ${name}`)
  try {
    await fn()
    results.push({ name, status: 'passed' })
  } catch (error) {
    results.push({ name, status: 'failed', detail: String(error) })
    console.error(String(error))
  }
  writeFileSync(join(runRoot, 'results.json'), JSON.stringify({ runRoot, results }, null, 2))
}

await test('flow-choice', async () => {
  const cwd = await fixture('flow-choice')
  const first = await turn(cwd, '/rpi change retryDelay to capped exponential delay', 'choose-flow')
  assert.equal(documents(cwd).length, 0, 'Wait for flow selection before research questions')
  assert.match(first.messages, /design discussion/i)
  assert.match(first.messages, /PRD/)
  assert.match(first.messages, /TDD/)
  assert.match(first.messages, /```(?:text)?\n[\s\S]*->[\s\S]*```/, 'Flow choice did not include an ASCII chart')
  assert.ok(!first.messages.includes('```mermaid'), 'Flow choice used Mermaid instead of ASCII')
  await turn(cwd, 'Use the TDD flow.', 'questions', first.thread)
  const saved = report(cwd, 'research-questions')
  assert.equal(saved.metadata.flow, 'tdd')
  assert.ok(!saved.text.includes('Change retryDelay to capped exponential'), 'Questions remain objective')
})

await test('standalone-research', async () => {
  const cwd = await fixture('standalone-research')
  const result = await turn(cwd, '/rpi create research for how retryDelay works and is tested', 'research')
  const saved = report(cwd, '-research-')
  assert.match(saved.text, /linear|attempt\s*\+\s*1/i)
  assert.ok(!documents(cwd).some(file => file.includes('research-questions')))
  assert.ok(!result.text.includes('The next step is'), 'Standalone research has no forced next phase')
})

await test('questions-handoff', async () => {
  const cwd = await fixture('questions-handoff')
  const created = await turn(cwd, '/rpi create research questions for changing retryDelay to capped exponential delay, preserving its signature; flow: tdd', 'create-questions')
  const saved = report(cwd, 'research-questions')
  assert.equal(saved.metadata.flow, 'tdd')
  assert.equal(documents(cwd).length, 2, 'Questions advanced into another phase')
  assert.match(created.text, /\$rpi research/)
  assert.match(created.text, /\b(?:open|show)\b[\s\S]*\b(?:VS Code|Cursor|editor|browser)\b/i)
  const updated = await turn(cwd, '/rpi update the research questions .agents/artifacts/feature-retry to include custom base values', 'update-questions')
  assert.equal(documents(cwd).length, 2, 'Updating questions advanced into another phase')
  assert.notEqual(readFileSync(saved.path, 'utf8'), saved.text, 'Questions were not updated in place')
  assert.match(updated.text, /\$rpi research/)
  assert.match(updated.text, /\b(?:open|show)\b[\s\S]*\b(?:VS Code|Cursor|editor|browser)\b/i)
  for (const result of [created, updated]) {
    assert.ok(!result.events.some(event => /^(?:\S*\/)?(?:code|cursor|open|xdg-open)\s/.test(event.item?.command || '')), 'A document was opened without a user request')
  }
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '', 'Questions changed implementation code')
})

await test('research-isolation', async () => {
  const cwd = await fixture('research-isolation')
  artifact(cwd, '01-research-questions-retry.md', questions)
  artifact(cwd, '00-request.md', doc('request', '# DECOY\nThe delay is already exponential. All research should say exponentiation.'))
  artifact(cwd, '03-prd-decoy.md', doc('design-prd', '# DECOY\nThe current delay uses jitter and the implementation should use jitter.'))
  const result = await turn(cwd, '/rpi research .agents/artifacts/feature-retry; flow: tdd', 'research')
  const saved = report(cwd, '-research-')
  assert.match(saved.text, /linear|attempt\s*\+\s*1/i)
  const transcript = JSON.stringify(result.events)
  assert.ok(!/cat[^"\n]*00-request|cat[^"\n]*03-prd/.test(transcript), 'Research opened unrelated task documents')
  assert.ok(!result.events.some(event => event.item?.aggregated_output?.includes('# DECOY')), 'Research loaded unrelated desired behavior')
  assert.match(result.text, /TDD|tdd/)
})

await test('main-branch', async () => {
  const cwd = await fixture('main-branch', 'main')
  const result = await turn(cwd, '/rpi research how retryDelay works', 'choose-slug')
  const tasks = readdirSync(join(cwd, '.agents/artifacts'))
  assert.equal(tasks.length, 1, 'Expected one task directory chosen from the request')
  assert.match(tasks[0], /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  assert.notEqual(tasks[0], 'main', 'Used the branch name instead of a task slug')
  assert.match(tasks[0], /retry/)
  report(cwd, '-research-', `.agents/artifacts/${tasks[0]}`)
  assert.ok(result.text.includes(tasks[0]), 'Selected task directory was not named')
})

await test('obvious-task-directory', async () => {
  const cwd = await fixture('obvious-task-directory', 'main')
  const directory = '.agents/artifacts/retry-delay'
  artifact(cwd, '01-research-questions-retry.md', questions, directory)
  artifact(cwd, '01-research-questions-theme.md', doc('research-questions', '# Theme Research\nHow are theme colors defined?'), '.agents/artifacts/theme-colors')
  const result = await turn(cwd, '/rpi research how retryDelay works', 'reuse-task')
  report(cwd, '-research-', directory)
  assert.deepEqual(readdirSync(join(cwd, '.agents/artifacts')).sort(), ['retry-delay', 'theme-colors'])
  assert.equal(documents(cwd, '.agents/artifacts/theme-colors').length, 1, 'Unrelated task was changed')
  assert.match(result.text, /retry-delay/)
})

await test('ambiguous-task-directory', async () => {
  const cwd = await fixture('ambiguous-task-directory', 'main')
  const client = '.agents/artifacts/client-retry-delay'
  const server = '.agents/artifacts/server-retry-delay'
  artifact(cwd, '01-research-questions-retry.md', questions, client)
  artifact(cwd, '01-research-questions-retry.md', questions, server)
  const result = await turn(cwd, '/rpi research how retryDelay works', 'ask-task')
  assert.deepEqual(readdirSync(join(cwd, '.agents/artifacts')).sort(), ['client-retry-delay', 'server-retry-delay'])
  for (const directory of [client, server]) {
    assert.deepEqual(documents(cwd, directory), ['01-research-questions-retry.md'], 'Wrote to an ambiguous task before asking')
    assert.equal(readFileSync(join(cwd, directory, '01-research-questions-retry.md'), 'utf8'), questions)
  }
  assert.match(result.messages, /client-retry-delay/)
  assert.match(result.messages, /server-retry-delay/)
  assert.match(result.messages, /\?/)
  await turn(cwd, 'Use server-retry-delay.', 'selected-task', result.thread)
  report(cwd, '-research-', server)
  assert.equal(documents(cwd, client).length, 1)
})

await test('explicit-directory', async () => {
  const cwd = await fixture('explicit-directory', 'main')
  await turn(cwd, '/rpi create research how retryDelay works; save it in "notes/retry study"', 'research')
  report(cwd, '-research-', 'notes/retry study')
})

await test('iterate-research', async () => {
  const cwd = await fixture('iterate-research')
  artifact(cwd, '02-research-retry.md', research)
  await turn(cwd, '/rpi update the research .agents/artifacts/feature-retry: add how custom base values are handled', 'iterate')
  assert.equal(documents(cwd).length, 1)
  assert.match(report(cwd, '-research-').text, /base|100/)
})

await test('design-discussion', async () => {
  const cwd = await fixture('design-discussion')
  artifact(cwd, '00-request.md', doc('request', '# Request\nMake retry delays grow faster after repeated failures, while keeping the wait bounded. Preserve the existing function signature. Choose the growth formula and maximum during the design discussion.'))
  artifact(cwd, '02-research-retry.md', research)
  const first = await turn(cwd, '/rpi make a design discussion .agents/artifacts/feature-retry', 'create')
  const saved = report(cwd, 'design-discussion')
  assert.match(saved.text, /Design Questions/)
  assert.match(first.messages, /\?/)
  await turn(cwd, 'Use your recommended option for that choice. Continue with the next question.', 'decide', first.thread)
  assert.equal(documents(cwd).filter(name => name.includes('design-discussion')).length, 1)
  assert.notEqual(report(cwd, 'design-discussion').text, saved.text, 'The settled choice was not recorded')
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '', 'Design changed implementation code')
})

await test('design-with-settled-choices', async () => {
  const cwd = await fixture('design-with-settled-choices')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '02-research-retry.md', research)
  await turn(cwd, '/rpi make a design discussion .agents/artifacts/feature-retry', 'settled')
  const saved = report(cwd, 'design-discussion')
  const resolved = saved.text.split(/## Resolved Design Questions[^\n]*\n/)[1]
  assert.ok(resolved, 'Already settled choices were not recorded')
  assert.match(resolved, /1000/)
  assert.match(resolved, /signature/)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('design-without-research', async () => {
  const cwd = await fixture('design-without-research')
  const result = await turn(cwd, '/rpi make a design discussion for changing src/retry.js to exponential delays with a maximum, preserving the signature. We still need to choose the maximum. Save it in .agents/artifacts/feature-retry', 'design')
  const saved = report(cwd, 'design-discussion')
  assert.match(saved.text, /linear|attempt\s*\+\s*1/i, 'Current state was not grounded in the live code')
  assert.match(result.messages, /\?/)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('design-needs-desired-result', async () => {
  const cwd = await fixture('design-needs-desired-result')
  artifact(cwd, '02-research-retry.md', research)
  const result = await turn(cwd, '/rpi make a design discussion .agents/artifacts/feature-retry', 'ask-result')
  assert.ok(!documents(cwd).some(name => name.includes('design-discussion')), 'Invented a desired change from current-state research')
  assert.match(result.messages, /\?/)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('design-clarification', async () => {
  const cwd = await fixture('design-clarification')
  artifact(cwd, '02-research-retry.md', research)
  artifact(cwd, '03-design-discussion-retry.md', draftDiscussion)
  const result = await turn(cwd, '/rpi continue the design discussion .agents/artifacts/feature-retry. Would choosing a maximum of 1000 change the first attempt\'s delay?', 'clarify')
  assert.equal(report(cwd, 'design-discussion').text, draftDiscussion, 'A clarifying question was treated as a decision')
  assert.match(result.messages, /100/)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('fresh-design-decision', async () => {
  const cwd = await fixture('fresh-design-decision')
  artifact(cwd, '02-research-retry.md', research)
  artifact(cwd, '03-design-discussion-retry.md', draftDiscussion)
  const result = await turn(cwd, '/rpi resume the design discussion .agents/artifacts/feature-retry. Use a maximum of 2000; that choice is settled. Continue with the next question.', 'decide')
  const saved = report(cwd, 'design-discussion')
  assert.equal(documents(cwd).filter(name => name.includes('design-discussion')).length, 1)
  assert.match(saved.text.split('## Resolved Design Questions')[1], /2000/)
  assert.match(result.messages, /jitter/)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('design-early-handoff', async () => {
  const cwd = await fixture('design-early-handoff')
  artifact(cwd, '02-research-retry.md', research)
  artifact(cwd, '03-design-discussion-retry.md', draftDiscussion)
  await turn(cwd, '/rpi continue the design discussion .agents/artifacts/feature-retry. Use a maximum of 1000. Stop here and save the settled choices and remaining questions so I can resume next session.', 'handoff')
  const saved = report(cwd, 'design-discussion')
  assert.match(saved.text.split('## Resolved Design Questions')[1], /1000/)
  assert.match(saved.text.split('## Design Questions')[1].split('## Resolved Design Questions')[0], /jitter/)
  assert.equal(documents(cwd).filter(name => name.includes('design-discussion')).length, 1)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('design-early-implementation', async () => {
  const cwd = await fixture('design-early-implementation')
  artifact(cwd, '02-research-retry.md', research)
  artifact(cwd, '03-design-discussion-retry.md', draftDiscussion)
  await turn(cwd, '/rpi continue the design discussion .agents/artifacts/feature-retry. Use the recommended maximum and no jitter. Implement now; skip the outline and any further interview.', 'implement-now')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(2), 400)
  assert.equal(retryDelay(9), 1000)
  assert.ok(!documents(cwd).some(name => name.includes('outline')))
  assert.match(report(cwd, 'design-discussion').text.split('## Resolved Design Questions')[1], /1000/)
  await shell(cwd, ['bun', 'test'])
})

await test('prd-interview', async () => {
  const cwd = await fixture('prd-interview')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '02-research-retry.md', research)
  const first = await turn(cwd, '/rpi make a PRD .agents/artifacts/feature-retry', 'create')
  assert.match(first.messages, /\?/)
  const saved = report(cwd, '-prd-')
  assert.match(saved.text, /Problem to Solve/)
  const second = await turn(cwd, 'Yes, that problem statement is right.', 'problem', first.thread)
  assert.match(second.text, /success|measure|know|test/i)
  await turn(cwd, '/rpi resume the PRD .agents/artifacts/feature-retry', 'fresh-resume')
  assert.equal(documents(cwd).filter(name => name.includes('-prd-')).length, 1)
})

await test('tdd-interview', async () => {
  const cwd = await fixture('tdd-interview')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '02-research-retry.md', research)
  let result = await turn(cwd, '/rpi make a TDD .agents/artifacts/feature-retry', 'create')
  const saved = report(cwd, '-tdd-')
  assert.match(result.messages, /\?/)
  assert.match(saved.text, /System Design/)
  let approvals = 0
  for (let i = 0; i < 8; i++) {
    const approve = /review|approve|sign.off|confirm.*design/i.test(result.text)
    if (approve) approvals++
    result = await turn(cwd, approve ? 'I approve that design section. Continue.' : 'Use your recommended option. That choice is settled; continue.', `decision-${i}`, result.thread)
    if (/(?:[$]|\/)rpi (implement|make an outline)/i.test(result.text)) break
  }
  assert.match(result.text, /(?:[$]|\/)rpi (implement|make an outline)/i, 'TDD did not finish within the bounded interview')
  assert.ok(approvals >= 2, 'System and program design need separate approvals')
  assert.match(report(cwd, '-tdd-').text, /Program Design/)
})

await test('outline-and-feedback', async () => {
  const cwd = await fixture('outline-and-feedback')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '02-research-retry.md', research)
  await turn(cwd, '/rpi make an outline .agents/artifacts/feature-retry for the requested delay change', 'create')
  const saved = report(cwd, 'outline')
  assert.match(saved.text, /Automated Verification/)
  await turn(cwd, '/rpi update the outline .agents/artifacts/feature-retry to include a test for attempt zero', 'iterate')
  assert.equal(documents(cwd).filter(file => file.includes('outline')).length, 1)
  assert.match(readFileSync(join(cwd, 'src/retry.js'), 'utf8'), /attempt \+ 1/)
})

await test('direct-implementation', async () => {
  const cwd = await fixture('direct-implementation')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '02-research-retry.md', research)
  const result = await turn(cwd, '/rpi implement .agents/artifacts/feature-retry', 'implement')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(2), 400)
  assert.equal(retryDelay(9), 1000)
  assert.ok(!documents(cwd).some(file => /outline|implementation/.test(file)))
  assert.match(result.text, /visual-pr/)
  await shell(cwd, ['bun', 'test'])
})

await test('phase-pause-and-resume', async () => {
  const cwd = await fixture('phase-pause-and-resume')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '03-outline-retry.md', outline)
  const first = await turn(cwd, '/rpi implement .agents/artifacts/feature-retry', 'phase-one')
  let text = readFileSync(join(cwd, 'src/retry.js'), 'utf8')
  assert.ok(!/Math[.]min|1000/.test(text), 'Default implementation ran phase 2 before review')
  const progress = report(cwd, 'outline').text
  assert.ok(!progress.includes('## ✅ Phase 1'), 'Unconfirmed manual checks marked complete')
  await turn(cwd, 'I tested phase 1 and the manual check passed. Continue to phase 2.', 'phase-two', first.thread)
  text = readFileSync(join(cwd, 'src/retry.js'), 'utf8')
  assert.match(text, /1000/)
})

await test('all-phases', async () => {
  const cwd = await fixture('all-phases')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '03-outline-retry.md', outline)
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry just do all the phases without stopping', 'all')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(9), 1000)
  const saved = report(cwd, 'outline').text
  assert.ok(!saved.includes('## ✅ Phase 1'), 'Manual verification was not supplied')
  await shell(cwd, ['bun', 'test'])
})

await test('implementation-feedback', async () => {
  const cwd = await fixture('implementation-feedback')
  await turn(cwd, '/rpi fix the implementation: retryDelay(-1) should throw a RangeError. Add a regression test.', 'fix')
  await shell(cwd, ['bun', 'test'])
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.throws(() => retryDelay(-1), RangeError)
})

await test('no-repository', async () => {
  const cwd = await fixture('no-repository', '', false)
  await turn(cwd, '/rpi research how retryDelay works; save the report in notes', 'research')
  assert.deepEqual(report(cwd, '-research-', 'notes').metadata.repos, [])
  assert.equal(readFileSync(join(cwd, '.gitignore'), 'utf8'), '.agents/skills/\n')
})

await test('multiple-repositories', async () => {
  const cwd = await fixture('multiple-repositories', '', false)
  const one = await fixture('multiple-repositories/client', 'feature/client')
  const two = await fixture('multiple-repositories/server', 'feature/server')
  writeFileSync(join(two, 'src/retry.js'), 'export function retryDelay(attempt, base = 200) { return base * (attempt + 1) }\n')
  await turn(cwd, '/rpi research how retryDelay is implemented in client/src/retry.js and server/src/retry.js; save in .agents/artifacts/compare', 'compare')
  const saved = report(cwd, '-research-', '.agents/artifacts/compare')
  assert.equal((saved.metadata.repos as unknown[]).length, 2)
  assert.match(saved.text, /100/)
  assert.match(saved.text, /200/)
  for (const repo of [one, two]) {
    const sha = await shell(repo, ['git', 'rev-parse', 'HEAD'])
    assert.ok(saved.text.includes(sha))
  }
})

await test('newest-document', async () => {
  const cwd = await fixture('newest-document')
  const older = research.replace('retryDelay uses', 'Older report: retryDelay uses')
  artifact(cwd, '01-research-old.md', older)
  artifact(cwd, '03-research-current.md', research)
  artifact(cwd, '04-research-questions-future.md', questions)
  const result = await turn(cwd, '/rpi update the research .agents/artifacts/feature-retry to cover custom base values', 'iterate')
  assert.equal(readFileSync(join(cwd, '.agents/artifacts/feature-retry/01-research-old.md'), 'utf8'), older)
  assert.equal(readFileSync(join(cwd, '.agents/artifacts/feature-retry/04-research-questions-future.md'), 'utf8'), questions)
  assert.match(result.text, /03-research-current/)
  assert.equal(documents(cwd).length, 3)
})

await test('research-only-handoff', async () => {
  const cwd = await fixture('research-only-handoff')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '01-research-questions-retry.md', questions.replace('flow: tdd', 'flow: research-only'))
  const result = await turn(cwd, '/rpi research .agents/artifacts/feature-retry', 'research')
  assert.match(result.text, /\$rpi implement/)
  assert.equal(report(cwd, '-research-').metadata.flow, 'research-only')
})

await test('whats-next', async () => {
  const cwd = await fixture('whats-next')
  artifact(cwd, '01-research-questions-retry.md', questions.replace('flow: tdd', 'flow: prd'))
  artifact(cwd, '02-research-retry.md', research.replace('flow: tdd', 'flow: prd'))
  artifact(cwd, '03-product-requirements-retry.md', doc('design-prd', '# Approved PRD\n## Problem to Solve\nRetries need a bounded wait.\n## Success\nThe delay grows exponentially and stays at or below 1000.\n## Proposed Solution\nCapped exponential delay.\n## Solution Details\nPreserve the existing signature.\nThe user approved this product solution.'))
  const before = documents(cwd)
  const result = await turn(cwd, "/rpi what's next .agents/artifacts/feature-retry", 'next')
  assert.match(result.text, /TDD|tdd/)
  assert.deepEqual(documents(cwd), before)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('iterate-questions', async () => {
  const cwd = await fixture('iterate-questions')
  artifact(cwd, '01-research-questions-retry.md', questions)
  await turn(cwd, '/rpi update the research questions .agents/artifacts/feature-retry: include the behavior of attempt zero and custom base', 'iterate')
  assert.equal(documents(cwd).length, 1)
  assert.match(report(cwd, 'research-questions').text, /zero|0/)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('fresh-phase-resume', async () => {
  const cwd = await fixture('fresh-phase-resume')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '03-outline-retry.md', outline)
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry', 'first-phase')
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry; I tested phase 1, the manual verification passed, continue with phase 2', 'fresh-second')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(9), 1000)
  const saved = report(cwd, 'outline').text
  assert.match(saved, /\[x\] User reviews the exponential/i)
  assert.ok(/Phase 1[^\n]*✅|✅[^\n]*Phase 1/.test(saved))
})

await test('existing-ignore', async () => {
  const cwd = await fixture('existing-ignore')
  writeFileSync(join(cwd, '.gitignore'), '.agents/\n')
  await turn(cwd, '/rpi research how retryDelay works', 'research')
  report(cwd, '-research-')
  assert.equal(readFileSync(join(cwd, '.gitignore'), 'utf8'), '.agents/\n')
})

await test('blocked-artifacts', async () => {
  const cwd = await fixture('blocked-artifacts')
  const first = await turn(cwd, '/rpi research how retryDelay works', 'blocked', undefined, false)
  assert.equal(documents(cwd).length, 0)
  assert.deepEqual(readdirSync(cwd).filter(file => file.endsWith('.md')), ['README.md'])
  assert.match(first.text, /write|writable|permission|blocked/i)
  await turn(cwd, 'Use artifacts/retry instead.', 'authorized-path', first.thread, false)
  report(cwd, '-research-', 'artifacts/retry')
})

await test('automated-only-phases', async () => {
  const cwd = await fixture('automated-only-phases')
  const automatic = outline.replaceAll(/#### Manual Verification\n- \[ \] User reviews[^\n]*[\n]/g, '')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '03-outline-retry.md', automatic)
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry', 'implement')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(2), 400)
  assert.equal(retryDelay(9), 1000, 'Paused before completing the automated-only outline')
  const saved = report(cwd, 'outline').text
  assert.match(saved, /- \[x\] Phase 1/)
  assert.match(saved, /- \[x\] Phase 2/)
  assert.ok(!/^- \[ \]/m.test(saved), 'Automated validation remained unchecked')
  await shell(cwd, ['bun', 'test'])
})

await test('fallback-without-delegation', async () => {
  const cwd = await fixture('fallback-without-delegation')
  const result = await turn(cwd, '/rpi research how retryDelay works. Use codebase-analyzer for the implementation analysis.', 'inline-fallback', undefined, true, false)
  report(cwd, '-research-')
  assert.ok(result.events.some(event => event.item?.command?.includes('references/subagents/codebase-analyzer.md')), 'Inline fallback did not read the mirrored agent')
})

await test('fallback-with-generic-delegation', async () => {
  const cwd = await fixture('fallback-with-generic-delegation')
  const result = await turn(cwd, '/rpi research how retryDelay works. Delegate the codebase-analyzer investigation to a subagent.', 'delegated-fallback', undefined, true, true)
  report(cwd, '-research-')
  assert.ok(result.events.some(event => event.item?.command?.includes('references/subagents/codebase-analyzer.md')), 'Generic fallback did not read the mirrored agent')
  assert.ok(result.thread, 'No Codex thread id returned')
  const calls = sessionToolCalls(result.thread)
  writeFileSync(join(runRoot, 'logs', 'fallback-with-generic-delegation', 'delegated-fallback.tool-calls.json'), JSON.stringify(calls, null, 2))
  assert.ok(calls.includes('spawn_agent'), 'No delegated agent was launched')
})

await test('explicit-skill-loading', async () => {
  const cwd = await fixture('explicit-skill-loading', 'feature/retry', true, false)
  const result = await turn(cwd, 'Create standalone research about how retryDelay works and is tested.', 'explicit-path', undefined, true, false, true)
  report(cwd, '-research-')
  assert.ok(result.events.some(event => event.item?.command?.includes(join(source, 'SKILL.md'))), 'The explicitly named skill was not read')
  assert.ok(!existsSync(join(cwd, '.agents/skills/rpi')), 'Skill discovery was available in this fixture')
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('nested-delegation', async () => {
  const cwd = await fixture('nested-delegation')
  const result = await turn(cwd, '/rpi research how retryDelay works and is tested. Delegate the implementation analysis to a generic codebase-analyzer subagent using the mirrored instructions. Have that subagent delegate test-file inspection to its own generic subagent, wait for its findings, and include them in its answer.', 'nested', undefined, true, true)
  report(cwd, '-research-')
  assert.ok(result.thread, 'No Codex thread id returned')
  const children = sessionEvents(result.thread)
    .filter(event => event.payload?.item?.type === 'SubAgentActivity' && event.payload.item.kind === 'started')
    .map(event => event.payload.item.agent_thread_id as string)
  assert.ok(children.length, 'No child agent was started')
  const evidence = children.map(thread => ({ thread, tools: sessionToolCalls(thread) }))
  writeFileSync(join(runRoot, 'logs', 'nested-delegation', 'nested.evidence.json'), JSON.stringify(evidence, null, 2))
  assert.ok(evidence.some(child => child.tools.includes('spawn_agent')), 'No child agent launched a grandchild')
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('document-precedence', async () => {
  const cwd = await fixture('document-precedence')
  artifact(cwd, '00-request.md', request.replace('1000', '2000'))
  artifact(cwd, '02-research-retry.md', research)
  artifact(cwd, '03-prd-retry.md', doc('design-prd', '# PRD\nUse exponential delay capped at 500.'))
  artifact(cwd, '04-tdd-retry.md', doc('design-tdd', '# TDD\n## System Design\nUse exponential delay capped at 800.\n## Program Design\nKeep the current signature.'))
  artifact(cwd, '05-outline-retry.md', outline)
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry; run all phases', 'precedence')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(9), 1000)
})

await test('latest-user-direction', async () => {
  const cwd = await fixture('latest-user-direction')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '03-outline-retry.md', outline)
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry; run all phases and use a cap of 2000 instead of 1000', 'latest')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(9), 2000)
})

await test('finished-iteration-needs-feedback', async () => {
  const cwd = await fixture('finished-iteration-needs-feedback')
  artifact(cwd, '02-research-retry.md', research)
  await turn(cwd, '/rpi iterate research .agents/artifacts/feature-retry', 'ask-feedback')
  assert.equal(report(cwd, '-research-').text, research)
  assert.equal(documents(cwd).length, 1)
})

await test('missing-task', async () => {
  const cwd = await fixture('missing-task')
  const result = await turn(cwd, '/rpi create research questions', 'ask-task')
  assert.equal(documents(cwd).length, 0)
  assert.match(result.messages, /task|change|research|question/i)
})

await test('fresh-program-design', async () => {
  const cwd = await fixture('fresh-program-design')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '02-research-retry.md', research)
  const tdd = doc('design-tdd', '# TDD\n\n## System Design\nThe existing helper returns capped exponential delays; keep the same callers and inputs. The user approved this system design.\n\n## Program Design\n\n## Patterns to Follow\nUse the current helper and Bun tests in src/retry.test.js.')
  artifact(cwd, '03-tdd-retry.md', tdd)
  const result = await turn(cwd, '/rpi resume the TDD .agents/artifacts/feature-retry', 'program')
  assert.match(result.messages, /program|code shape|inline|function|constant/i)
  assert.ok(!result.messages.includes('review **System Design**'), 'Already approved system design restarted')
  assert.equal(documents(cwd).filter(name => name.includes('-tdd-')).length, 1)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('local-visuals', async () => {
  const cwd = await fixture('local-visuals')
  writeFileSync(join(cwd, 'index.html'), '<!doctype html><style>:root { --accent: #185c55; --paper: #fcf4e8; } body { background:var(--paper); color:var(--accent); font-family:Georgia; } button { background:var(--accent); color:var(--paper); }</style><h1>Retry Settings</h1><button>Run</button>')
  artifact(cwd, '00-request.md', doc('request', '# Request\nAdd a retry settings panel with base and max delay fields. Follow the existing colors and typography in index.html.'))
  artifact(cwd, '03-prd-retry-settings.md', doc('design-prd', '# Retry Settings\n## Problem to Solve\nUsers need to adjust retry delays. Approved by the user.\n## Success\nUsers can configure both values. Approved by the user.\n## Proposed Solution\n\n## Solution Details\n\n## Deferred to TDD\nNone.'))
  const result = await turn(cwd, '/rpi update the PRD .agents/artifacts/feature-retry: compare inline panel and modal options using local HTML mockups, then ask me which to choose', 'visuals')
  const directory = join(cwd, '.agents/artifacts/feature-retry')
  const mockups = readdirSync(directory).filter(name => name.endsWith('.html'))
  assert.ok(mockups.length > 0, 'No local HTML mockups')
  for (const file of mockups) {
    assert.ok(readFileSync(join(directory, file), 'utf8').includes('#185c55'), 'Existing palette was not used')
  }
  assert.match(result.messages, /[.]html/)
  assert.ok(!result.messages.includes('task-artifact'))
  assert.match(report(cwd, '-prd-').text, /[.]html/)
})

async function finishInterview(cwd: string, start: Awaited<ReturnType<typeof turn>>, label: string, minimumApprovals: number) {
  let result = start
  let approvals = 0
  for (let i = 0; i < 12; i++) {
    if (/(?:[$]|\/)rpi (make (an outline|a TDD)|implement)/i.test(result.text)) {
      assert.ok(approvals >= minimumApprovals, `${label}: handoff before the required approvals`)
      return result
    }
    const approval = /approve|review.*(whole|start|finish|section|design|details)|sign.off/i.test(result.text)
    if (approval) approvals++
    result = await turn(cwd,
      approval ? 'I approve that completed section. Continue.' : 'Use your recommended choice. That decision is settled; continue.',
      `${label}-${i}`, result.thread)
  }
  assert.fail(`${label}: interview did not finish in 12 turns`)
}

await test('end-to-end-tdd', async () => {
  const cwd = await fixture('end-to-end-tdd')
  await turn(cwd, '/rpi create research questions for changing retryDelay to base * 2 ** attempt capped at 1000, preserving the current signature; flow: tdd', 'questions')
  assert.match(report(cwd, '-request-').text, /1000/)
  assert.equal(report(cwd, 'research-questions').metadata.flow, 'tdd')
  await turn(cwd, '/rpi research .agents/artifacts/feature-retry; flow: tdd', 'research')
  assert.match(report(cwd, '-research-').text, /linear|attempt\s*\+\s*1/i)
  const design = await turn(cwd, '/rpi make a TDD .agents/artifacts/feature-retry; flow: tdd', 'tdd')
  await finishInterview(cwd, design, 'tdd-choice', 2)
  await turn(cwd, '/rpi make an outline .agents/artifacts/feature-retry', 'outline')
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry; do all phases', 'implement')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(0), 100)
  assert.equal(retryDelay(2), 400)
  assert.equal(retryDelay(9), 1000)
  await shell(cwd, ['bun', 'test'])
})

await test('end-to-end-prd', async () => {
  const cwd = await fixture('end-to-end-prd')
  await turn(cwd, '/rpi create research questions for changing retryDelay to base * 2 ** attempt capped at 1000, preserving the current signature; flow: prd', 'questions')
  await turn(cwd, '/rpi research .agents/artifacts/feature-retry; flow: prd', 'research')
  const product = await turn(cwd, '/rpi make a PRD .agents/artifacts/feature-retry; flow: prd', 'prd')
  await finishInterview(cwd, product, 'prd-choice', 1)
  const design = await turn(cwd, '/rpi make a TDD .agents/artifacts/feature-retry; flow: prd', 'tdd')
  await finishInterview(cwd, design, 'tdd-choice', 2)
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry directly from the documents', 'implement')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(2), 400)
  assert.equal(retryDelay(9), 1000)
  assert.ok(!documents(cwd).some(name => name.includes('outline')))
  await shell(cwd, ['bun', 'test'])
})

await test('explicit-new-document', async () => {
  const cwd = await fixture('explicit-new-document')
  artifact(cwd, '05-research-retry.md', research)
  await turn(cwd, '/rpi create a new research report about the test coverage in src/retry.test.js; task directory .agents/artifacts/feature-retry', 'new-report')
  assert.equal(readFileSync(join(cwd, '.agents/artifacts/feature-retry/05-research-retry.md'), 'utf8'), research)
  assert.equal(documents(cwd).length, 2)
  assert.ok(documents(cwd).some(name => name.startsWith('06-research-')))
})

await test('explicit-document-path', async () => {
  const cwd = await fixture('explicit-document-path')
  artifact(cwd, '01-research-selected.md', research)
  artifact(cwd, '03-research-newer.md', research)
  await turn(cwd, '/rpi update .agents/artifacts/feature-retry/01-research-selected.md to cover custom base values', 'selected-path')
  assert.equal(readFileSync(join(cwd, '.agents/artifacts/feature-retry/03-research-newer.md'), 'utf8'), research)
  assert.notEqual(readFileSync(join(cwd, '.agents/artifacts/feature-retry/01-research-selected.md'), 'utf8'), research)
  assert.equal(documents(cwd).length, 2)
})

await test('partial-research-resume', async () => {
  const cwd = await fixture('partial-research-resume')
  artifact(cwd, '02-research-retry.md', research.replace('status: complete', 'status: draft').replace('## Open Questions\nNone.', '## Open Questions\nHow does a custom base affect the calculation?'))
  await turn(cwd, '/rpi resume research .agents/artifacts/feature-retry', 'resume')
  assert.equal(documents(cwd).length, 1)
  assert.match(report(cwd, '-research-').text, /200|custom base/i)
  assert.equal(await shell(cwd, ['git', 'diff', '--', 'src']), '')
})

await test('whats-next-draft', async () => {
  const cwd = await fixture('whats-next-draft')
  artifact(cwd, '00-request.md', request)
  artifact(cwd, '03-tdd-retry.md', doc('design-tdd', '# Draft TDD\n## System Design\nThe existing helper returns capped exponential delays. The user approved this system design.\n## Program Design\n'))
  const before = documents(cwd)
  const result = await turn(cwd, "/rpi what's next .agents/artifacts/feature-retry", 'next-draft')
  assert.match(result.messages, /resume|continue|finish|complete.*program/i)
  assert.match(result.messages, /TDD|tdd|program design/i)
  assert.deepEqual(documents(cwd), before)
})

await test('end-to-end-discussion', async () => {
  const cwd = await fixture('end-to-end-discussion')
  await turn(cwd, '/rpi create research questions for changing retryDelay to base * 2 ** attempt capped at 1000, preserving the current signature; flow: design-discussion', 'questions')
  await turn(cwd, '/rpi research .agents/artifacts/feature-retry; flow: design-discussion', 'research')
  const discussion = await turn(cwd, '/rpi make a design discussion .agents/artifacts/feature-retry; flow: design-discussion', 'discussion')
  await finishInterview(cwd, discussion, 'discussion-choice', 0)
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry directly from the agreed design', 'implement')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(2), 400)
  assert.equal(retryDelay(9), 1000)
  await shell(cwd, ['bun', 'test'])
})

await test('end-to-end-research-only', async () => {
  const cwd = await fixture('end-to-end-research-only')
  await turn(cwd, '/rpi create research questions for changing retryDelay to base * 2 ** attempt capped at 1000, preserving the current signature; flow: research-only', 'questions')
  const result = await turn(cwd, '/rpi research .agents/artifacts/feature-retry; flow: research-only', 'research')
  assert.match(result.text, /\$rpi implement/)
  await turn(cwd, '/rpi implement .agents/artifacts/feature-retry', 'implement')
  const { retryDelay } = await import(join(cwd, 'src/retry.js'))
  assert.equal(retryDelay(2), 400)
  assert.equal(retryDelay(9), 1000)
  assert.ok(!documents(cwd).some(name => /tdd|prd|discussion|outline/.test(name)))
  await shell(cwd, ['bun', 'test'])
})

assert.deepEqual(selected.filter(name => !results.some(result => result.name === name)), [], 'Unknown live test names')
console.log(JSON.stringify({ runRoot, results }, null, 2))
process.exitCode = results.some(result => result.status === 'failed') ? 1 : 0
