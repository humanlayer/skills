import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const plugin = join(root, 'plugins/rpi')
const skill = join(plugin, 'skills/rpi')
const phases = [
  'create-research-questions', 'iterate-research-questions',
  'create-research', 'iterate-research',
  'create-design-discussion', 'iterate-design-discussion',
  'create-prd', 'iterate-prd', 'create-tdd', 'iterate-tdd',
  'create-structure-outline', 'iterate-structure-outline',
  'implement-outline', 'iterate-implementation',
]
const agents = [
  'codebase-locator', 'codebase-analyzer', 'codebase-pattern-finder',
  'web-search-researcher', 'outline-implementer-agent',
]

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)],
  )
}

const frontmatter = (content: string) => Bun.YAML.parse(content.split('---')[1]) as Record<string, unknown>
const main = readFileSync(join(skill, 'SKILL.md'), 'utf8')
assert.equal(frontmatter(main).name, 'rpi')

for (const phase of phases) {
  assert.ok(main.includes(phase), phase)
  const process = readFileSync(join(skill, `references/${phase}/process.md`), 'utf8')
  assert.match(process, /^## [1-9][.]/m, `Ordered process: ${phase}`)
  assert.match(process, /final_answer/, `Final-answer reference: ${phase}`)
}

const manifest = JSON.parse(readFileSync(join(plugin, '.claude-plugin/plugin.json'), 'utf8'))
assert.equal(manifest.name, 'rpi')
assert.equal(manifest.agents.length, agents.length)
for (const agent of agents) {
  const source = readFileSync(join(plugin, `agents/${agent}.md`), 'utf8')
  assert.equal(frontmatter(source).name, agent)
  assert.equal(source, readFileSync(join(skill, `references/subagents/${agent}.md`), 'utf8'))
  assert.ok(manifest.agents.includes(`./agents/${agent}.md`))
}

const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8'))
assert.equal(marketplace.plugins.filter((p: {name: string}) => p.name === 'rpi').length, 1)

const templates = files(skill).filter(path => path.endsWith('_template.md'))
for (const template of templates) {
  const metadata = frontmatter(readFileSync(template, 'utf8'))
  assert.ok(Array.isArray(metadata.repos), `Repo list in ${template}`)
  assert.deepEqual(Object.keys((metadata.repos as Record<string, unknown>[])[0]).sort(), ['identifier', 'sha'])
  for (const old of ['git_commit', 'repo', 'repository', 'sha', 'branch']) {
    assert.ok(!(old in metadata), `Old single-repo field ${old} in ${template}`)
  }
}
for (const file of files(plugin).filter(path => path.endsWith('.md'))) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(/\$SKILLBASE\/(references\/[a-zA-Z0-9_./-]+\.md)/g)) {
    if (match[1].includes('SUBAGENT_NAME')) continue
    assert.ok(existsSync(join(skill, match[1])), `Missing reference ${match[1]} in ${file}`)
  }
  assert.doesNotMatch(text, /\.humanlayer\/|task-artifact|\bLinear\b|\bJira\b|\bimplement-plan\b|\bcreate-plan\b/)
}
assert.deepEqual(
  files(skill).filter(path => path.endsWith('/SKILL.md')),
  [join(skill, 'SKILL.md')],
  'Only the top-level RPI skill is independently discoverable',
)
console.log(`RPI checks passed: ${phases.length} phases, ${agents.length} agents, ${templates.length} document templates`)
