// Scrape the logged-in My Mods page for draft name -> mod ID, match to mods.json, write nexusModId.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG_PATH = path.join(HERE, 'mods.json')
const CFG = JSON.parse(fs.readFileSync(CFG_PATH, 'utf8'))
const PROFILE = path.join(HERE, 'profile')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: false, channel: 'chrome',
  viewport: { width: 1500, height: 950 },
  args: ['--disable-blink-features=AutomationControlled'],
})
const page = ctx.pages()[0] || (await ctx.newPage())

// Try the drafts/mods management views.
const urls = [
  'https://www.nexusmods.com/my/mods?tab=drafts',
  'https://www.nexusmods.com/infectionfreezone/users/myaccount?tab=mods',
  'https://www.nexusmods.com/my/mods',
]
const found = new Map() // id -> name

for (const u of urls) {
  await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
  if ((await page.title()).includes('Just a moment')) { await sleep(15000) }
  await sleep(2500)
  // Grab every anchor to /<game>/mods/<id> and its visible text / nearby title.
  const links = await page.$$eval('a[href*="/mods/"]', (as) =>
    as.map((a) => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim() }))
  )
  for (const l of links) {
    const m = l.href.match(/\/(?:infectionfreezone)\/mods\/(\d+)/) || l.href.match(/\/mods\/(\d+)/)
    if (!m) continue
    const id = parseInt(m[1], 10)
    if (l.text && l.text.length > 1 && !found.has(id)) found.set(id, l.text)
  }
  if (found.size > 0) break
}

console.log('Scraped id -> name:')
for (const [id, name] of [...found].sort((a, b) => a[0] - b[0])) console.log(' ', id, ':', name)

// Match to mods.json by loose name compare.
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, '') }
let matched = 0
for (const mod of CFG.mods) {
  if (mod.nexusModId) continue
  const target = norm(mod.name)
  for (const [id, name] of found) {
    if (norm(name) === target || norm(name).includes(target) || target.includes(norm(name))) {
      mod.nexusModId = id
      matched++
      console.log(`  matched ${mod.key} -> ${id} (${name})`)
      break
    }
  }
}
fs.writeFileSync(CFG_PATH, JSON.stringify(CFG, null, 2) + '\n')
console.log(`\nMatched ${matched} mods. Review mods.json, fill any blanks manually, then run nexus-upload.mjs.`)
console.log('Browser left open so you can read the My Mods page if matches are incomplete. Ctrl+C when done.')
await new Promise(() => {})
