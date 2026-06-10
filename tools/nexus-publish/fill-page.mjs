// Fill a Nexus draft mod page's details (name, summary, full-description sections, tags) from
// mods.json, via the logged-in web UI. No API exists for mod-page detail edits — web only.
//
// Usage:  node fill-page.mjs IFZModAPI
//         node fill-page.mjs DarkerNights
//
// Best-effort selectors. It fills what it can, logs ✓/✗ per field, then leaves the browser open
// and pauses so you can fix anything + Save. The edit-page rich text uses section placeholders;
// the script types into each placeholder paragraph.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const GAME = CFG.game.slug
const key = process.argv[2]
if (!key) { console.error('usage: node fill-page.mjs <modKey>'); process.exit(1) }
const mod = CFG.mods.find((m) => m.key === key)
if (!mod) { console.error(`unknown mod key: ${key}`); process.exit(1) }
if (!mod.nexusModId) { console.error(`${key} has no nexusModId`); process.exit(1) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ctx = await chromium.launchPersistentContext(path.join(HERE, 'profile'), {
  headless: false, channel: 'chrome',
  viewport: { width: 1500, height: 950 },
  args: ['--disable-blink-features=AutomationControlled'],
})
const page = ctx.pages()[0] || (await ctx.newPage())

const editUrls = [
  `https://www.nexusmods.com/${GAME}/mods/edit/?id=${mod.nexusModId}`,
  `https://www.nexusmods.com/${GAME}/mods/${mod.nexusModId}?tab=description&edit=true`,
  `https://www.nexusmods.com/${GAME}/mods/${mod.nexusModId}`,
]
let onEdit = false
for (const u of editUrls) {
  await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
  if ((await page.title()).includes('Just a moment')) await sleep(15000)
  await sleep(2000)
  // Heuristic: an edit page has a Mod Name / Summary field or the section editor.
  const hasForm = await page.locator('input, textarea, div[contenteditable="true"]').count().catch(() => 0)
  if (hasForm > 0) { onEdit = true; console.log(`[edit] ${u}`); break }
}
if (!onEdit) console.log('[warn] could not confirm an edit form — fill manually in the open browser')

async function fill(selectors, value, label) {
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first()
      await el.waitFor({ state: 'visible', timeout: 3000 })
      await el.click({ clickCount: 3 }).catch(() => {})
      await el.fill(value)
      console.log(`  ✓ ${label}`)
      return true
    } catch {}
  }
  console.log(`  ✗ ${label}`)
  return false
}

// Name + summary
await fill(['input[name="name"]', 'input[placeholder*="mod name" i]', 'input[placeholder="Enter mod name"]'], mod.name, 'Mod Name')
const shortDesc = mod.summary.length > 350 ? mod.summary.slice(0, 347) + '...' : mod.summary
await fill(['textarea[name="summary"]', 'textarea[placeholder*="describe" i]', 'textarea[placeholder*="briefly" i]'], shortDesc, 'Short description')

// Full-description section placeholders
const sections = mod.sections || {}
const placeholders = [
  ['Description', /Describe the main purpose of your mod/i, sections.description],
  ['Installation', /Lay out any steps users must follow/i, sections.installation],
  ['Main features', /Describe the core features of your mod/i, sections.mainFeatures],
  ['Requirements', /Provide info on additional required steps/i, sections.requirements],
  ['Shout outs', /Say thanks to anyone who inspired or helped you/i, sections.shoutOuts],
]
for (const [name, ph, content] of placeholders) {
  if (!content) continue
  try {
    const el = page.getByText(ph).first()
    await el.click({ timeout: 3000 })
    await page.keyboard.press('ControlOrMeta+A').catch(() => {})
    await page.keyboard.press('Delete').catch(() => {})
    await page.keyboard.type(content, { delay: 0 })
    console.log(`  ✓ section ${name}`)
  } catch {
    console.log(`  ✗ section ${name} (placeholder not found — may already be filled)`)
  }
}

// Tags — click matching popular-tag buttons
for (const tag of mod.tags || []) {
  try {
    await page.locator(`button:has-text("${tag}")`).first().click({ timeout: 2000 })
    console.log(`  ✓ tag ${tag}`)
  } catch { console.log(`  ✗ tag ${tag}`) }
  await sleep(200)
}

console.log('\nFilled best-effort. Review in browser, set requirements/category/image, then SAVE. Ctrl+C when done.')
await new Promise(() => {})
