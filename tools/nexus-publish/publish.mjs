#!/usr/bin/env node
// IFZMods Nexus publish pipeline.
//
// Real flow (confirmed via screenshots):
//   1. Any Nexus page has a top-nav "Upload" button.
//   2. Click → modal with three tiles: Upload mod / Upload image / Upload video.
//   3. Click "Upload mod" → "Create your draft mod page" modal:
//        - Mod Name (text)
//        - Short description (textarea, 350 char max)
//        - Game (dropdown, preset to current game context)
//        - Category (dropdown, default "Miscellaneous")
//        - Create draft / Cancel
//   4. Click "Create draft" → redirects to draft edit page with full form
//      (long description, version, file upload, permissions, screenshots).
//
// This script automates steps 1-4 for each mod in mods.json. After "Create draft"
// you take over for the remaining fields per mod (long description, file upload),
// then click Submit. Script captures the resulting numeric mod ID from the URL.
//
// Modes:
//   --login-only      Open browser, persist Nexus login cookies in ./profile, then wait forever.
//   --create          Loop unpublished mods, drive each through the modal flow.
//   --create --auto   Same, but also click "Create draft" automatically.
//   --update          Loop, navigate to existing mods' file-edit tab and upload new DLL.
//   --dry-run         Do the first unpublished mod, stop before "Create draft" — inspect form, Ctrl+C when done.

import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG_PATH = path.join(HERE, 'mods.json')
const PROFILE_DIR = path.join(HERE, 'profile')

const NEXUS_BASE = 'https://www.nexusmods.com'
const GAME_SLUG = 'infectionfreezone'
// User's per-game "My Mods" tab has an "Add a file" button that opens the draft modal directly
// with Game = Infection Free Zone preselected. Cleanest entry point.
const HOME_URL = `${NEXUS_BASE}/${GAME_SLUG}/users/myaccount?tab=mods`
const ACCOUNT_URL = `${NEXUS_BASE}/users/myaccount`

const args = new Set(process.argv.slice(2))
const MODE = {
  loginOnly: args.has('--login-only'),
  create: args.has('--create'),
  update: args.has('--update'),
  auto: args.has('--auto'),
  dryRun: args.has('--dry-run'),
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function loadCfg() {
  return JSON.parse(await fs.readFile(CFG_PATH, 'utf8'))
}
async function saveCfg(cfg) {
  await fs.writeFile(CFG_PATH, JSON.stringify(cfg, null, 2) + '\n', 'utf8')
}

async function isLoggedIn(page) {
  await page.goto(ACCOUNT_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  // Cloudflare interstitial title is "Just a moment..." — wait it out then retry detection.
  if ((await page.title()).includes('Just a moment')) {
    console.log('[cf] Cloudflare challenge — waiting 15s for it to clear…')
    await sleep(15_000)
  }
  return !/sign-in|login/i.test(page.url())
}

// Try a list of selectors. First one that succeeds wins.
async function clickFirst(page, selectors, label, timeout = 5000) {
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first()
      await el.waitFor({ state: 'visible', timeout })
      await el.click()
      console.log(`  ✓ click ${label} via ${sel}`)
      return true
    } catch {}
  }
  console.log(`  ✗ ${label} — none matched: ${selectors.join(' | ')}`)
  return false
}

async function fillFirst(page, selectors, value, label, timeout = 5000) {
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first()
      await el.waitFor({ state: 'visible', timeout })
      await el.click({ clickCount: 3 }).catch(() => {})
      await el.fill(value)
      console.log(`  ✓ ${label} via ${sel}`)
      return true
    } catch {}
  }
  console.log(`  ✗ ${label} — none matched: ${selectors.join(' | ')}`)
  return false
}

async function openUploadModModal(page) {
  console.log('[step] click "Add a file" button on My Mods page')
  await clickFirst(page, [
    'button:has-text("Add a file")',
    'a:has-text("Add a file")',
    '[aria-label="Add a file"]',
  ], '"Add a file" button')
  await sleep(1000)
}

async function fillDraftModal(page, mod, common) {
  console.log(`[fill] ${mod.key}`)
  // Wait briefly for the draft modal to render after "Upload mod" click
  await sleep(800)
  const modal = page.locator('div[role="dialog"]').last()
  // Debug: count modals to confirm one is open
  const modalCount = await page.locator('div[role="dialog"]').count().catch(() => 0)
  console.log(`  (${modalCount} dialog(s) open)`)

  // --- Mod Name (text input under "Mod Name" label) ---
  try {
    await modal.getByLabel(/mod name/i).fill(mod.name, { timeout: 5000 })
    console.log(`  ✓ Mod Name via getByLabel`)
  } catch {
    await fillFirst(page, [
      'div[role="dialog"] input[placeholder*="mod name" i]',
      'div[role="dialog"] input[placeholder="Enter mod name"]',
      'div[role="dialog"] input[type="text"]',
    ], mod.name, 'Mod Name (fallback)')
  }

  // --- Short description (textarea, 350-char max) ---
  const shortDesc = mod.summary.length > 350 ? mod.summary.slice(0, 347) + '...' : mod.summary
  try {
    await modal.getByLabel(/short description/i).fill(shortDesc, { timeout: 5000 })
    console.log(`  ✓ Short description via getByLabel`)
  } catch {
    await fillFirst(page, [
      'div[role="dialog"] textarea[placeholder*="describe" i]',
      'div[role="dialog"] textarea',
    ], shortDesc, 'Short description (fallback)')
  }

  // --- Game + Category dropdowns ---
  // IFZ only exposes "Miscellaneous" as a category. Game is preset. Skip both dropdowns.
  console.log('[step] category: leaving Miscellaneous (only option IFZ exposes)')
}

async function clickCreateDraft(page) {
  console.log('[step] click "Create draft"')
  return clickFirst(page, [
    'div[role="dialog"] button:has-text("Create draft")',
    'button:has-text("Create draft")',
  ], 'Create draft button')
}

async function captureModId(page) {
  // After Create draft, Nexus redirects to the draft edit page.
  // URL pattern: /infectionfreezone/mods/<id> or /infectionfreezone/mods/<id>?tab=...
  const m = page.url().match(/\/mods\/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

// Fill the section-template Full description editor.
// Each section has a heading + a placeholder paragraph. We click each placeholder
// and type the content for that section.
async function fillSection(page, headingText, content) {
  if (!content) return false
  // Strategy: find the placeholder by its <p> with placeholder text, click, type.
  const placeholders = {
    'Description': /Describe the main purpose of your mod/i,
    'Installation instructions': /Lay out any steps users must follow/i,
    'Main features': /Describe the core features of your mod/i,
    'Requirements': /Provide info on additional required steps/i,
    'Shout outs': /Say thanks to anyone who inspired or helped you/i,
  }
  const placeholder = placeholders[headingText]
  if (!placeholder) {
    console.log(`  ✗ unknown section "${headingText}"`)
    return false
  }
  try {
    const el = page.getByText(placeholder).first()
    await el.click({ timeout: 4000 })
    await page.keyboard.press('ControlOrMeta+A').catch(() => {})
    await page.keyboard.press('Delete').catch(() => {})
    await page.keyboard.type(content, { delay: 0 })
    console.log(`  ✓ section "${headingText}" (${content.length} chars)`)
    return true
  } catch (e) {
    console.log(`  ✗ section "${headingText}" — ${e.message.split('\n')[0]}`)
    return false
  }
}

async function clickTag(page, tagName) {
  // Popular tags are visible buttons. Click each one whose text matches.
  for (const sel of [
    `button:has-text("${tagName}"):not(:has-text("${tagName} ")):not(:has(*))`,
    `button:has-text("${tagName}")`,
    `[role="button"]:has-text("${tagName}")`,
  ]) {
    try {
      const el = page.locator(sel).first()
      await el.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {})
      await el.click({ timeout: 2000 })
      console.log(`  ✓ tag "${tagName}"`)
      return true
    } catch {}
  }
  // Fallback: type into the "Type tag to add" autocomplete
  try {
    const input = page.locator('input[placeholder*="tag" i]').first()
    await input.fill(tagName, { timeout: 2000 })
    await sleep(300)
    await page.keyboard.press('Enter')
    console.log(`  ✓ tag "${tagName}" via autocomplete`)
    return true
  } catch {
    console.log(`  ✗ tag "${tagName}" — not found`)
    return false
  }
}

async function fillEditPage(page, mod, common) {
  console.log(`[edit] filling draft edit page for ${mod.key}`)
  await sleep(2000)

  // --- Full description sections ---
  if (mod.sections) {
    console.log('[edit] full description')
    await fillSection(page, 'Description', mod.sections.description)
    await fillSection(page, 'Installation instructions', mod.sections.installation)
    await fillSection(page, 'Main features', mod.sections.mainFeatures)
    await fillSection(page, 'Requirements', mod.sections.requirements)
    await fillSection(page, 'Shout outs', mod.sections.shoutOuts)
  }

  // --- Tags ---
  if (mod.tags?.length) {
    console.log('[edit] tags')
    for (const tag of mod.tags) {
      await clickTag(page, tag)
      await sleep(200)
    }
  }

  // --- File upload (Files tab or in-page) ---
  console.log('[edit] file upload')
  const dllAbs = path.resolve(HERE, mod.dllPath)
  // First, try to navigate to Files tab if it exists
  for (const sel of ['button:has-text("Files")', 'a:has-text("Files")', '[role="tab"]:has-text("Files")']) {
    try {
      await page.locator(sel).first().click({ timeout: 1500 })
      console.log(`  ✓ Files tab via ${sel}`)
      await sleep(800)
      break
    } catch {}
  }
  // Hidden file input
  try {
    const fileInputs = await page.locator('input[type="file"]').all()
    if (fileInputs.length > 0) {
      await fileInputs[fileInputs.length - 1].setInputFiles(dllAbs)
      console.log(`  ✓ file: ${path.basename(dllAbs)}`)
    } else {
      console.log(`  ✗ no file input found — upload manually: ${dllAbs}`)
    }
  } catch (e) {
    console.log(`  ✗ file upload — ${e.message.split('\n')[0]}`)
  }

  // --- Version ---
  try {
    const versionInput = page.locator('input[placeholder*="version" i], input[name="version"]').first()
    await versionInput.fill(common.version, { timeout: 3000 })
    console.log(`  ✓ version: ${common.version}`)
  } catch {
    console.log(`  ✗ version field not found — set manually`)
  }
}

async function main() {
  const cfg = await loadCfg()
  await fs.mkdir(PROFILE_DIR, { recursive: true })

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: 'chrome', // use system Chrome — no Playwright Chromium download required
    viewport: { width: 1500, height: 950 },
    args: ['--disable-blink-features=AutomationControlled'],
  })
  const page = ctx.pages()[0] || (await ctx.newPage())

  if (MODE.loginOnly) {
    await page.goto(`${NEXUS_BASE}/auth/sign-in`, { waitUntil: 'domcontentloaded' })
    console.log('[login] Sign in via the browser. Profile saved to ./profile when you close the browser.')
    console.log('[login] Close browser when done. Press Ctrl+C if you want to bail.')
    await new Promise(() => {}) // wait forever
    return
  }

  if (!(await isLoggedIn(page))) {
    console.error('[fatal] not logged in. Run: npm run login')
    process.exit(1)
  }
  console.log('[ok] session is logged in')

  if (MODE.create || MODE.dryRun) {
    for (const mod of cfg.mods) {
      if (mod.nexusModId && !MODE.dryRun) {
        console.log(`[skip] ${mod.key} (nexusModId=${mod.nexusModId})`)
        continue
      }
      console.log(`\n=== ${mod.key} ===`)
      console.log(`[nav] ${HOME_URL}`)
      await page.goto(HOME_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
      if ((await page.title()).includes('Just a moment')) {
        console.log('[cf] Cloudflare challenge — waiting 15s')
        await sleep(15_000)
      }
      await sleep(1500)

      await openUploadModModal(page)
      await fillDraftModal(page, mod, cfg.common)

      if (MODE.dryRun) {
        console.log('\n[dry-run] form filled. Inspect modal in browser. Ctrl+C to exit.')
        await page.pause() // Playwright Inspector
        return
      }

      if (MODE.auto) {
        await clickCreateDraft(page)
      } else {
        console.log('[semi-auto] Modal is filled. Click "Create draft" yourself when ready.')
        console.log('[semi-auto] Script waits up to 5 min for the redirect to /mods/<id>.')
      }

      try {
        await page.waitForURL(/\/mods\/\d+/, { timeout: 5 * 60 * 1000 })
        const modId = await captureModId(page)
        if (modId) {
          mod.nexusModId = modId
          await saveCfg(cfg)
          console.log(`[done] ${mod.key} → mod ${modId} (saved to mods.json)`)

          // Auto-fill the draft edit page
          await fillEditPage(page, mod, cfg.common)

          console.log(`[wait] Edit page filled best-effort. Review any '✗' fields, set permissions / adult flags / screenshots if you want, then click Publish.`)
          console.log(`[wait] Press Enter in this terminal to move to the next mod.`)
          await new Promise((resolve) => process.stdin.once('data', resolve))
        } else {
          console.log(`[warn] ${mod.key} — redirected but no ID parsed. Check mods.json manually.`)
        }
      } catch {
        console.log(`[timeout] ${mod.key} — no /mods/<id> redirect within 5 min. Skipping.`)
      }
    }
  }

  if (MODE.update) {
    for (const mod of cfg.mods) {
      if (!mod.nexusModId) {
        console.log(`[skip] ${mod.key} — no nexusModId, run --create first`)
        continue
      }
      const editUrl = `${NEXUS_BASE}/${GAME_SLUG}/mods/${mod.nexusModId}?tab=files&edit=true`
      console.log(`[update] ${mod.key} → ${editUrl}`)
      await page.goto(editUrl, { waitUntil: 'domcontentloaded' })
      await sleep(2000)
      const dllAbs = path.resolve(HERE, mod.dllPath)
      const fileInput = await page.$('input[type="file"]')
      if (fileInput) {
        await fileInput.setInputFiles(dllAbs)
        console.log(`  ✓ file: ${path.basename(dllAbs)}`)
        console.log('[semi-auto] Fill version + changelog. Click Submit. Press Enter for next.')
        await new Promise((resolve) => process.stdin.once('data', resolve))
      } else {
        console.log(`  ✗ couldn't find file input — handle manually, then press Enter`)
        await new Promise((resolve) => process.stdin.once('data', resolve))
      }
    }
  }

  console.log('[done]')
  await ctx.close()
}

main().catch((e) => {
  console.error('[fatal]', e)
  process.exit(1)
})
