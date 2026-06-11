// Upload a placeholder/screenshot to each mod's Nexus gallery via the real edit/media page.
// We drive the page's own file input so Nexus's JS builds the (multipart) upload — no need to
// reverse-engineer the multipart shape. Confirmed endpoints it fires:
//   POST /api/games/{gameId}/mods/{id}/images   (gallery image)
//   POST /api/flamework/mods/media/save         (commit)
// Edit-media page: https://www.nexusmods.com/games/<game>/mods/<id>/edit/media
//
// Source image per mod: media/<key>.png (gen-banners.mjs output, or drop a real screenshot
// with the same name to override).
//
// Usage:  node upload-media.mjs            # all mods with a page + image
//         node upload-media.mjs DarkerNights
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const GAME = CFG.game.slug
const MEDIA = path.join(HERE, 'media')
const only = process.argv[2] || null
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ctx = await chromium.launchPersistentContext(path.join(HERE, 'profile'), {
  headless: false, channel: 'chrome',
  viewport: { width: 1500, height: 950 },
  args: ['--disable-blink-features=AutomationControlled'],
})
const page = ctx.pages()[0] || (await ctx.newPage())

const targets = CFG.mods.filter((m) => m.nexusModId && (!only || m.key === only))
for (const mod of targets) {
  const img = path.join(MEDIA, `${mod.key}.png`)
  if (!fs.existsSync(img)) { console.log(`[skip] ${mod.key} — no image at ${img}`); continue }
  const editMedia = `https://www.nexusmods.com/games/${GAME}/mods/${mod.nexusModId}/edit/media`
  console.log(`\n=== ${mod.key} (mod ${mod.nexusModId}) ===`)
  await page.goto(editMedia, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
  if ((await page.title()).includes('Just a moment')) await sleep(15000)
  await sleep(2500)

  // The page has a hidden file input for gallery images. Set it and wait for the upload response.
  let ok = false
  try {
    const respP = page.waitForResponse(
      (r) => /\/mods\/\d+\/images$/.test(r.url().split('?')[0]) && r.request().method() === 'POST',
      { timeout: 45000 }
    ).catch(() => null)
    const inputs = await page.locator('input[type="file"]').all()
    if (!inputs.length) { console.log('  ✗ no file input on edit/media page — UI changed?'); }
    else {
      await inputs[inputs.length - 1].setInputFiles(img)
      const resp = await respP
      if (resp) {
        const txt = await resp.text().catch(() => '')
        ok = resp.status() === 200 && /"status"\s*:\s*true|image-tile/.test(txt)
        console.log(`  ${ok ? '✓' : '✗'} gallery upload [${resp.status()}]`)
      } else {
        console.log('  ? upload response not seen (may still have uploaded — verify)')
      }
    }
  } catch (e) {
    console.log(`  ✗ ${e.message.split('\n')[0]}`)
  }

  // Commit media arrangement.
  try {
    const res = await page.evaluate(async (gid_mid) => {
      const r = await fetch('https://next.nexusmods.com/api/flamework/mods/media/save', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(gid_mid), credentials: 'include',
      })
      return { status: r.status, text: await r.text() }
    }, { gameId: 7442, modId: mod.nexusModId })
    console.log(`  media/save [${res.status}] ${res.text.slice(0, 60)}`)
  } catch (e) { console.log(`  media/save failed: ${e.message.split('\n')[0]}`) }

  await sleep(1500)
}
console.log('\n[done] Verify galleries. Set a main/thumbnail per page if not auto-set, then publish.')
await ctx.close()
