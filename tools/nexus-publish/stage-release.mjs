#!/usr/bin/env node
// stage-release.mjs — deterministic mods.json field mutator, so an LLM never has to
// read the ~117KB mods.json to bump a release. Round-trip is byte-identical to the
// existing 2-space format (verified), so a mutation is a minimal one-field diff.
//
// Usage:
//   node stage-release.mjs <KEY> --version <X> [--notes "<fileNotes>"] [--summary "<summary>"] [--check]
//   node stage-release.mjs SmartWorkerRedist --version 1.2.1 --notes "..."   # write
//   node stage-release.mjs SmartWorkerRedist --version 1.2.1 --check         # dry-run, no write
//
// Multiple mods: run once per key (each is one process = one turn for the caller).
// Prints OLD -> NEW for each changed field so the caller sees the result WITHOUT
// reading the big file. Exits non-zero on unknown key / missing --version.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const MODS = path.join(HERE, 'mods.json')

const argv = process.argv.slice(2)
const key = argv.find((a) => !a.startsWith('--'))
const CHECK = argv.includes('--check')
const flag = (name) => {
  const i = argv.indexOf('--' + name)
  return i >= 0 && i + 1 < argv.length && !argv[i + 1].startsWith('--') ? argv[i + 1] : null
}
const version = flag('version')
const notes = flag('notes')
const summary = flag('summary')

if (!key) { console.error('ERR: no mod KEY given'); process.exit(2) }
if (!version) { console.error('ERR: --version required'); process.exit(2) }

const raw = fs.readFileSync(MODS, 'utf8')
const json = JSON.parse(raw)
const mod = (json.mods || []).find((m) => m.key === key)
if (!mod) {
  const keys = (json.mods || []).map((m) => m.key).join(', ')
  console.error(`ERR: key "${key}" not in mods.json. Known: ${keys}`)
  process.exit(2)
}

const changes = []
const set = (field, val) => {
  if (val == null) return
  if (mod[field] !== val) { changes.push(`${field}: ${JSON.stringify(mod[field])} -> ${JSON.stringify(val)}`); mod[field] = val }
  else changes.push(`${field}: (unchanged) ${JSON.stringify(val)}`)
}
set('version', version)
set('fileNotes', notes)
set('summary', summary)

// Nexus fileNotes hard cap = 255 chars, ASCII only — fail loud rather than truncate silently.
if (notes != null) {
  if (notes.length > 255) { console.error(`ERR: fileNotes ${notes.length} > 255 char cap`); process.exit(3) }
  if (/[^\x00-\x7F]/.test(notes)) { console.error('ERR: fileNotes has non-ASCII chars'); process.exit(3) }
}

console.log(`${key} (mod ${mod.nexusModId ?? '?'})`)
for (const c of changes) console.log('  ' + c)

if (CHECK) { console.log('  [--check: no write]'); process.exit(0) }

const out = JSON.stringify(json, null, 2) + (raw.endsWith('\n') ? '\n' : '')
fs.writeFileSync(MODS, out)
console.log('  written.')
