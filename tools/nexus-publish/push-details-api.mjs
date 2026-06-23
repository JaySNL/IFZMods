// Set mod-page details (name, summary, BBCode description, tags) with PURE node fetch — NO playwright.
// Same endpoint the draft edit form (and push-details.mjs) uses:
//   POST https://next.nexusmods.com/api/flamework/mods/save
// push-details.mjs drives this from inside a headful Chrome (page.evaluate) to dodge Cloudflare.
// This variant sends it directly with the session COOKIE + matching User-Agent, exactly like
// push-requirements.mjs / upload-media-api.mjs (cf_clearance is UA+IP-bound, so run on the same
// machine the cookie was captured on, while it's fresh). Removes the Google-Chrome dependency.
//
// Auth (.env.local, gitignored):  NEXUS_COOKIE='...'   NEXUS_UA='...'
//
// Usage:
//   node push-details-api.mjs                       # DRY RUN, all mods with a nexusModId
//   node push-details-api.mjs HighGround ClayPitFixes   # DRY RUN, just these
//   node push-details-api.mjs --send HighGround     # actually apply (outward-facing write)
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const GAME_ID = CFG.game?.numericId || 7442
const SLUG = CFG.game?.slug || 'infectionfreezone'
const AUTHOR = 'JaySNL'
const CATEGORY_ID = 2 // Miscellaneous (the only IFZ category)

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(HERE, f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}
loadEnv()
const COOKIE = process.env.NEXUS_COOKIE
const UA = process.env.NEXUS_UA || 'Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0'
if (!COOKIE) { console.error('No NEXUS_COOKIE in .env.local (capture it from DevTools).'); process.exit(1) }

const argv = process.argv.slice(2)
const SEND = argv.includes('--send')
const keys = new Set(argv.filter((a) => !a.startsWith('--')))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// --- sections -> BBCode (identical mapping to push-details.mjs) ---
function bb(mod) {
  const s = mod.sections
  if (!s) return mod.summary || ''
  const H = (t) => `[size=5][b]${t}[/b][/size]`
  const list = (text) => {
    const lines = text.split('\n')
    let out = [], buf = []
    const flush = () => { if (buf.length) { out.push('[list]' + buf.map((x) => '[*]' + x).join('') + '[/list]'); buf = [] } }
    for (const ln of lines) {
      const m = ln.match(/^\s*-\s+(.*)$/)
      if (m) buf.push(m[1])
      else { flush(); if (ln.trim()) out.push(ln) }
    }
    flush()
    return out.join('\n')
  }
  return [s.description, '', H('Main features'), list(s.mainFeatures), '', H('Installation'), list(s.installation),
    '', H('Requirements'), list(s.requirements), '', H('Credits'), list(s.shoutOuts)].join('\n')
}

const baseHeaders = {
  'User-Agent': UA,
  Cookie: COOKIE,
  'content-type': 'application/json',
  'api-version': '2020-01-01',
  Origin: 'https://www.nexusmods.com',
}

const TAGS_QUERY = `query LegacyTags ($excludeAdult: Boolean, $gameId: ID, $onlyAdult: Boolean) { legacyTags (excludeAdult: $excludeAdult, gameId: $gameId, onlyAdult: $onlyAdult) { blockable, global, id, name, parentId } }`

let tagMap = new Map()
try {
  const res = await fetch('https://next.nexusmods.com/api/graphql', {
    method: 'POST', headers: baseHeaders,
    body: JSON.stringify({ query: TAGS_QUERY, variables: { gameId: String(GAME_ID), excludeAdult: true, onlyAdult: false }, operationName: 'LegacyTags' }),
  })
  const j = JSON.parse(await res.text())
  for (const t of j?.data?.legacyTags || []) tagMap.set(t.name.toLowerCase(), t)
  console.log(`resolved ${tagMap.size} tags`)
} catch (e) { console.log('tag resolve failed (will send empty tags):', e.message) }

const targets = CFG.mods.filter((m) => m.nexusModId && (!keys.size || keys.has(m.key)))
if (!targets.length) { console.error('no matching mods'); process.exit(1) }
console.log(`${SEND ? '[SEND]' : '[dry-run]'} ${targets.length} mod(s)\n`)

for (const mod of targets) {
  const resolved = (mod.tags || []).map((t) => tagMap.get(t.toLowerCase())).filter(Boolean)
  const payload = {
    modId: mod.nexusModId, gameId: GAME_ID, name: mod.name,
    summary: (mod.summary || '').slice(0, 350), description: bb(mod),
    categoryId: CATEGORY_ID, author: AUTHOR, version: mod.version || CFG.common.version,
    type: '1', languageId: 0,
    tags: resolved.map((t) => ({ id: String(t.id), selected: true })),
    classtags: resolved.map((t) => String(t.id)), saveAllTags: true,
  }
  if (!SEND) {
    console.log(`= ${mod.key} (mod ${mod.nexusModId}) tags=${payload.tags.length} desc=${payload.description.length}ch`)
    continue
  }
  try {
    const res = await fetch('https://next.nexusmods.com/api/flamework/mods/save', {
      method: 'POST',
      headers: { ...baseHeaders, Referer: `https://www.nexusmods.com/games/${SLUG}/mods/${mod.nexusModId}/edit` },
      body: JSON.stringify(payload),
    })
    let text = ''
    try { text = await res.text() } catch {}
    console.log(`${res.ok ? '✓' : '✗'} ${mod.key} (mod ${mod.nexusModId}) [${res.status}] tags=${payload.tags.length}${res.ok ? '' : ' ' + text.slice(0, 200)}`)
  } catch (e) {
    console.log(`✗ ${mod.key}: ${e.message.split('\n')[0]}`)
  }
  await sleep(1500)
}
console.log('\n[done] Reload each page to verify; review before publishing the new drafts.')
