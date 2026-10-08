import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const plugin = resolve(root, 'plugins/rpi')
const references = resolve(plugin, 'skills/rpi/references')
const checking = process.argv.includes('--check')

function templates(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? templates(path) : /final_answer.*[.]md$/.test(entry.name) ? [path] : []
  })
}

for (const path of templates(references)) {
  const content = readFileSync(path, 'utf8')
  const normalized = content.replaceAll('/rpi ', '<rpi-invocation> ')
  if (checking) {
    if (content !== normalized) throw new Error(`Host-specific invocation in ${path}`)
  } else if (content !== normalized) {
    writeFileSync(path, normalized)
  }
}

const pairs: [string, string][] = [
  ['research-questions', 'research_questions_template.md'],
  ['design-discussion', 'design_discussion_template.md'],
  ['prd', 'prd_template.md'],
  ['tdd', 'tdd_template.md'],
  ['structure-outline', 'structure_outline_template.md'],
].map(([phase, file]) => [
  resolve(references, `create-${phase}/references/${file}`),
  resolve(references, `iterate-${phase}/references/${file}`),
])

for (const [phase, files] of [
  ['design-discussion', ['design_discussion_final_answer.md', 'design_discussion_final_answer_resolved.md']],
  ['prd', ['prd_final_answer_resolved.md']],
  ['tdd', ['tdd_final_answer_resolved.md']],
] as [string, string[]][]) {
  for (const file of files) {
    pairs.push([
      resolve(references, `create-${phase}/references/${file}`),
      resolve(references, `iterate-${phase}/references/${file}`),
    ])
  }
}

for (const name of [
  'codebase-locator', 'codebase-analyzer', 'codebase-pattern-finder',
  'web-search-researcher', 'outline-implementer-agent',
]) {
  pairs.push([
    resolve(plugin, `agents/${name}.md`),
    resolve(references, `subagents/${name}.md`),
  ])
}

for (const [source, target] of pairs) {
  const content = readFileSync(source, 'utf8')
  if (process.argv.includes('--check')) {
    if (readFileSync(target, 'utf8') !== content) throw new Error(`Reference differs: ${target}`)
  } else {
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
}

console.log(`${pairs.length} RPI reference copies ${process.argv.includes('--check') ? 'verified' : 'synced'}`)
