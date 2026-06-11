// Capture the media-upload request(s) the Nexus Media tab fires, so we can replay them.
// Logs request URL/method/headers/body AND response status/body for non-GET calls while you
// add an image to a draft's Media tab.
//
// Usage: node capture-media.mjs 42
//   1. Opens mod 42's page.
//   2. You go to the Images/Media tab, upload one image, set it as main, save.
//   3. Every relevant request+response is logged to captured-media.jsonl.
//   4. Ctrl+C, then I read it to build the replayer.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const GAME = CFG.game.slug
const id = process.argv[2]
if (!id) { console.error('usage: node capture-media.mjs <numericModId>'); process.exit(1) }
const OUT = path.join(HERE, 'captured-media.jsonl')
fs.writeFileSync(OUT, '')

const ctx = await chromium.launchPersistentContext(path.join(HERE, 'profile'), {
  headless: false, channel: 'chrome',
  viewport: { width: 1500, height: 950 },
  args: ['--disable-blink-features=AutomationControlled'],
})
const page = ctx.pages()[0] || (await ctx.newPage())

const INTERESTING = /image|media|upload|file|presign|s3|cloudflarestorage|flamework|graphql/i
function safeHeaders(h) {
  const o = {}
  for (const k of Object.keys(h)) o[k] = /authorization|cookie|apikey|token|amz/i.test(k) ? '<redacted>' : h[k]
  return o
}

page.on('request', (req) => {
  const m = req.method()
  if (m === 'GET' || m === 'OPTIONS') return
  const u = req.url()
  if (!INTERESTING.test(u)) return
  let body = null
  try { body = req.postData() } catch {}
  // For multipart, postData() may be huge/binary; cap it.
  if (body && body.length > 4000) body = body.slice(0, 4000) + `…[+${body.length - 4000}b]`
  fs.appendFileSync(OUT, JSON.stringify({ kind: 'req', ts: Date.now(), method: m, url: u, headers: safeHeaders(req.headers()), body }) + '\n')
  console.log(`→ ${m} ${u.slice(0, 90)}`)
})
page.on('response', async (res) => {
  const req = res.request()
  if (req.method() === 'GET' || req.method() === 'OPTIONS') return
  const u = res.url()
  if (!INTERESTING.test(u)) return
  let body = ''
  try { body = (await res.text()).slice(0, 2000) } catch {}
  fs.appendFileSync(OUT, JSON.stringify({ kind: 'res', ts: Date.now(), status: res.status(), url: u, body }) + '\n')
  console.log(`← ${res.status()} ${u.slice(0, 90)}`)
})

await page.goto(`https://www.nexusmods.com/${GAME}/mods/${id}`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
if ((await page.title()).includes('Just a moment')) await new Promise((r) => setTimeout(r, 15000))
console.log(`\nWatching: ${page.url()}`)
console.log('→ Open the Images/Media tab, upload an image, set as main, save. Requests log to captured-media.jsonl.')
console.log('→ Ctrl+C when done.')
await new Promise(() => {})
