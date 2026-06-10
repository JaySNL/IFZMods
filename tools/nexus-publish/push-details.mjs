// Bulk-set mod-page details (name, summary, BBCode description, tags) via Nexus's internal
// save endpoint — the same one the draft edit form uses:
//   POST https://next.nexusmods.com/api/flamework/mods/save
// Auth is the logged-in session cookie, so we fire the request from inside the Playwright
// browser context (page.request) where the cookie auto-attaches. No public API exists for this.
//
// Usage:  node push-details.mjs            # all mods with a nexusModId
//         node push-details.mjs IFZModAPI  # one mod
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const GAME_ID = 7442
const AUTHOR = 'JaySNL'
const CATEGORY_ID = 2 // Miscellaneous (the only IFZ category)
const only = process.argv[2] || null
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// --- sections -> BBCode ---
function bb(mod) {
  const s = mod.sections
  if (!s) return mod.summary || ''
  const H = (t) => `[size=5][b]${t}[/b][/size]`
  const list = (text) => {
    // Turn "- a\n- b" blocks into [list][*]a[*]b[/list]; leave other lines as paragraphs.
    const lines = text.split('\n')
    let out = []
    let buf = []
    const flush = () => { if (buf.length) { out.push('[list]' + buf.map((x) => '[*]' + x).join('') + '[/list]'); buf = [] } }
    for (const ln of lines) {
      const m = ln.match(/^\s*-\s+(.*)$/)
      if (m) buf.push(m[1])
      else { flush(); if (ln.trim()) out.push(ln) }
    }
    flush()
    return out.join('\n')
  }
  return [
    s.description,
    '',
    H('Main features'),
    list(s.mainFeatures),
    '',
    H('Installation'),
    list(s.installation),
    '',
    H('Requirements'),
    list(s.requirements),
    '',
    H('Credits'),
    list(s.shoutOuts),
  ].join('\n')
}

const TAGS_QUERY = `query LegacyTags ($excludeAdult: Boolean, $gameId: ID, $onlyAdult: Boolean) { legacyTags (excludeAdult: $excludeAdult, gameId: $gameId, onlyAdult: $onlyAdult) { blockable, global, id, name, parentId } }`

const ctx = await chromium.launchPersistentContext(path.join(HERE, 'profile'), {
  headless: false, channel: 'chrome',
  viewport: { width: 1400, height: 900 },
  args: ['--disable-blink-features=AutomationControlled'],
})
const page = ctx.pages()[0] || (await ctx.newPage())
await page.goto('https://www.nexusmods.com/infectionfreezone', { waitUntil: 'domcontentloaded', timeout: 60000 })
if ((await page.title()).includes('Just a moment')) { console.log('clearing CF…'); await sleep(15000) }

// In-page fetch — runs in the real browser JS context so Cloudflare clearance + session cookie
// apply (page.request uses a side context CF blocks with 403 "Just a moment").
async function pageFetch(url, body) {
  return page.evaluate(async ({ url, body }) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'api-version': '2020-01-01' },
      body: JSON.stringify(body),
      credentials: 'include',
    })
    let text = ''
    try { text = await r.text() } catch {}
    return { status: r.status, ok: r.ok, text }
  }, { url, body })
}

// Resolve tag name -> id for this game (non-adult).
let tagMap = new Map()
try {
  const res = await pageFetch('https://next.nexusmods.com/api/graphql', { query: TAGS_QUERY, variables: { gameId: String(GAME_ID), excludeAdult: true, onlyAdult: false }, operationName: 'LegacyTags' })
  const j = JSON.parse(res.text)
  for (const t of j?.data?.legacyTags || []) tagMap.set(t.name.toLowerCase(), t) // store full object
  console.log(`resolved ${tagMap.size} tags`)
} catch (e) { console.log('tag resolve failed (will send empty tags):', e.message) }

const targets = CFG.mods.filter((m) => m.nexusModId && (!only || m.key === only))
for (const mod of targets) {
  const resolved = (mod.tags || []).map((t) => tagMap.get(t.toLowerCase())).filter(Boolean)
  const tagObjs = resolved.map((t) => ({ id: String(t.id), selected: true }))
  const classtags = resolved.map((t) => String(t.id))
  const payload = {
    modId: mod.nexusModId,
    gameId: GAME_ID,
    name: mod.name,
    summary: (mod.summary || '').slice(0, 350),
    description: bb(mod),
    categoryId: CATEGORY_ID,
    author: AUTHOR,
    version: CFG.common.version,
    type: '1',
    languageId: 0,
    tags: tagObjs,
    classtags: classtags,
    saveAllTags: true,
  }
  try {
    const res = await pageFetch('https://next.nexusmods.com/api/flamework/mods/save', payload)
    console.log(`${res.ok ? '✓' : '✗'} ${mod.key} (mod ${mod.nexusModId}) [${res.status}] tags=${tagObjs.length}${res.ok ? '' : ' ' + res.text.slice(0, 200)}`)
  } catch (e) {
    console.log(`✗ ${mod.key}: ${e.message.split('\n')[0]}`)
  }
  await sleep(1500)
}
console.log('\n[done] Reload a page to verify. Review, then publish each.')
await ctx.close()
