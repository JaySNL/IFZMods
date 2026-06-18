// Render a branded placeholder banner PNG per mod from mods.json.
// 1280x720 (Nexus main-image ratio). Deterministic HTML -> PNG via Playwright/Chromium.
// Output: tools/nexus-publish/media/<key>.png
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const OUT = path.join(HERE, 'media')
fs.mkdirSync(OUT, { recursive: true })

// Accent color per loose category of mod (visual / gameplay / fix / lib).
function accent(mod) {
  const k = mod.key.toLowerCase()
  if (mod.isLibrary) return '#7c5cff'                         // lib = purple
  if (/dark|gunfire|cinematic|house/.test(k)) return '#ff7a18' // visual = ember orange
  if (/squad|vehicle|army|worker/.test(k)) return '#18a0ff'    // squads/logistics = blue
  if (/save|locale|split|deconstruct|explos|construction/.test(k)) return '#2ec26a' // utility/fix = green
  return '#18a0ff'
}

function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

function html(mod) {
  const c = accent(mod)
  const tag = (mod.tags && mod.tags[0]) || 'Mod'
  return `<!doctype html><html><head><meta charset="utf8"><style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif}
  html,body{width:1280px;height:720px;overflow:hidden}
  .card{width:1280px;height:720px;position:relative;
    background:radial-gradient(120% 120% at 80% 0%, #1c2230 0%, #0c0f16 55%, #07090d 100%);
    color:#e8edf5;display:flex;flex-direction:column;justify-content:center;padding:96px 110px}
  .grid{position:absolute;inset:0;opacity:.06;
    background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);
    background-size:48px 48px}
  .accent{position:absolute;left:0;top:0;bottom:0;width:14px;background:${c}}
  .glow{position:absolute;right:-180px;top:-180px;width:620px;height:620px;border-radius:50%;
    background:radial-gradient(circle, ${c}33 0%, transparent 70%)}
  .kicker{display:inline-flex;align-items:center;gap:14px;margin-bottom:26px}
  .badge{font-size:22px;font-weight:800;letter-spacing:.22em;color:#0c0f16;background:${c};
    padding:8px 16px;border-radius:6px}
  .tag{font-size:22px;letter-spacing:.18em;text-transform:uppercase;color:${c};font-weight:700}
  h1{font-size:84px;line-height:1.02;font-weight:800;letter-spacing:-.5px;max-width:1000px}
  .lib h1{font-size:76px}
  p{margin-top:34px;font-size:33px;line-height:1.4;color:#aeb8c8;max-width:980px;font-weight:400}
  .foot{position:absolute;left:110px;bottom:60px;font-size:24px;color:#5d6b80;letter-spacing:.04em}
  .foot b{color:#8b97a8;font-weight:700}
  .req{position:absolute;right:110px;bottom:60px;font-size:22px;color:${c};font-weight:700;letter-spacing:.06em}
  </style></head><body>
  <div class="card ${mod.isLibrary ? 'lib' : ''}">
    <div class="grid"></div><div class="glow"></div><div class="accent"></div>
    <div class="kicker"><span class="badge">IFZ MODS</span><span class="tag">${esc(tag)}</span></div>
    <h1>${esc(mod.name)}</h1>
    <p>${esc(mod.summary)}</p>
    <div class="foot"><b>github.com/JaySNL/IFZMods</b> &nbsp;·&nbsp; gameplay footage coming soon</div>
    ${mod.requires ? `<div class="req">requires IFZ Mod API</div>` : ''}
  </div></body></html>`
}

// Banner rendering needs no auth/profile — use bundled chromium (no system Chrome dependency).
const ctx = await chromium.launch({ headless: true })
const page = await ctx.newPage()
await page.setViewportSize({ width: 1280, height: 720 })
for (const mod of CFG.mods) {
  await page.setContent(html(mod), { waitUntil: 'load' })
  const out = path.join(OUT, `${mod.key}.png`)
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1280, height: 720 } })
  console.log('  ✓', path.basename(out))
}
await ctx.close()
console.log(`\nRendered ${CFG.mods.length} banners to ${OUT}`)
