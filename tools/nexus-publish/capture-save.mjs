// Capture the real save request(s) the Nexus draft-edit form fires, so we can replay them
// programmatically. The public v3 API has no mod-detail write; the site uses an internal
// backend (GraphQL / next route). This logs every non-GET request while you edit + save a draft.
//
// Usage: node capture-save.mjs 42
//   1. It opens draft 42's edit page.
//   2. You change a field (e.g. Short description) and click Save.
//   3. Every POST/PUT/PATCH (esp. graphql) is logged to captured-requests.jsonl with
//      url, method, relevant headers, and body.
//   4. Ctrl+C when done. Paste captured-requests.jsonl back (or I'll read it).
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const GAME = CFG.game.slug
const id = process.argv[2]
if (!id) { console.error('usage: node capture-save.mjs <numericModId>'); process.exit(1) }
const OUT = path.join(HERE, 'captured-requests.jsonl')
fs.writeFileSync(OUT, '')

const ctx = await chromium.launchPersistentContext(path.join(HERE, 'profile'), {
  headless: false, channel: 'chrome',
  viewport: { width: 1500, height: 950 },
  args: ['--disable-blink-features=AutomationControlled'],
})
const page = ctx.pages()[0] || (await ctx.newPage())

const INTERESTING = /graphql|\/api\/|mods|drafts|update|save|mutation/i
page.on('request', (req) => {
  const m = req.method()
  if (m === 'GET' || m === 'OPTIONS') return
  const u = req.url()
  if (!INTERESTING.test(u)) return
  let body = null
  try { body = req.postData() } catch {}
  const h = req.headers()
  // Keep auth-shape but redact actual token values so the log is safe to share.
  const safeHeaders = {}
  for (const k of Object.keys(h)) {
    if (/authorization|cookie|apikey|token/i.test(k)) safeHeaders[k] = '<redacted len=' + (h[k]?.length || 0) + '>'
    else safeHeaders[k] = h[k]
  }
  const rec = { ts: Date.now(), method: m, url: u, headers: safeHeaders, body }
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n')
  console.log(`  ${m} ${u.slice(0, 90)}${body ? '  (body ' + body.length + 'b)' : ''}`)
})

const editUrls = [
  `https://www.nexusmods.com/${GAME}/mods/edit/?id=${id}`,
  `https://next.nexusmods.com/${GAME}/mods/${id}/edit`,
  `https://www.nexusmods.com/${GAME}/mods/${id}`,
]
for (const u of editUrls) {
  await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
  await new Promise((r) => setTimeout(r, 2500))
  if (!page.url().includes('sign-in')) break
}
console.log(`\nWatching network on: ${page.url()}`)
console.log('→ Edit a field (e.g. Short description) and click SAVE. Requests will print here + log to captured-requests.jsonl.')
console.log('→ Ctrl+C when the save has gone through.')
await new Promise(() => {})
