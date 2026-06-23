// Stylized Nexus banners (1280x720) — nano-banana (Gemini 3.1 Flash Image) art + ImageMagick title overlay.
// NO playwright. Background/hero art is model-generated with "no text"; crisp title is stamped locally.
//
// Usage:
//   node gen-banners-ai.mjs SwarmFix              # one mod (sample)
//   node gen-banners-ai.mjs SwarmFix HousePower   # several
//   node gen-banners-ai.mjs --all                 # every mod in mods.json (costs ~$0.067 each)
//
// Key: reads GEMINI_API_KEY from .env.local then .env (both gitignored). Never printed.
// Output: media/<key>.png   (media/ is gitignored)
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { execFileSync } from 'node:child_process'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const OUT = path.join(HERE, 'media'); fs.mkdirSync(OUT, { recursive: true })
const TMP = path.join(HERE, '.banner-tmp'); fs.mkdirSync(TMP, { recursive: true })
const SRC = path.join(HERE, 'media-src'); fs.mkdirSync(SRC, { recursive: true }) // drop screenshots here: <ModKey>.png

const MODEL = 'gemini-3.1-flash-image'
const AF = path.join(HERE, 'assets', 'fonts')
const FONTS = {
  anton:   { file: path.join(AF, 'Anton-Regular.ttf'),       size: 150, isp: 18 }, // ultra-condensed (Bebas-like)
  archivo: { file: path.join(AF, 'ArchivoBlack-Regular.ttf'), size: 104, isp: 10 }, // heavy wide
  oswald:  { file: path.join(AF, 'Oswald-Bold.ttf'),          size: 124, isp: 14 }, // condensed bold
  nimbus:  { file: '/usr/share/fonts/gsfonts/NimbusSansNarrow-Bold.otf', size: 128, isp: 34 },
}
const FONT_SUB = '/usr/share/fonts/liberation/LiberationSans-Bold.ttf'

// ---- env ----
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
const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!KEY) { console.error('No GEMINI_API_KEY in .env.local/.env'); process.exit(1) }

// ---- accent color per loose category (mirrors gen-banners.mjs) ----
function accent(mod) {
  const k = mod.key.toLowerCase()
  if (mod.isLibrary) return '#7c5cff'
  if (/dark|gunfire|cinematic|house|flare|window|glow|light/.test(k)) return '#ff7a18' // visual = ember
  if (/squad|vehicle|army|worker|merge|grenade/.test(k)) return '#18a0ff'              // squads/logistics = blue
  if (/swarm|raider|hive|surround|explos/.test(k)) return '#e23b3b'                     // combat/threat = red
  if (/save|locale|split|deconstruct|construction|perf|quality|path/.test(k)) return '#2ec26a' // utility = green
  return '#18a0ff'
}

// ---- art prompt per mod ----
function artPrompt(mod) {
  const subject = (mod.summary || mod.name).replace(/\s+/g, ' ').trim()
  return [
    'Cinematic key art for a video-game mod thumbnail.',
    'Setting: a grim post-apocalyptic survival city-builder like Infection Free Zone — ruined modern city, overcast moody light, volumetric haze, embers and dust, high detail, dramatic rim lighting.',
    `Theme to evoke: ${mod.name} — ${subject}.`,
    EMBELLISH[mod.key] || '',
    `Use ${accent(mod)} as a subtle accent/glow color in the lighting.`,
    'Composition: keep the LEFT THIRD darker and visually quiet (it will hold a title overlay); put the focal subject on the right.',
    'ABSOLUTELY NO text, NO words, NO letters, NO numbers, NO logos, NO watermark, NO UI elements. Pure illustration only.',
    '16:9 widescreen, full-bleed.',
  ].filter(Boolean).join(' ')
}

// optional reference screenshot: media-src/<key>.(png|jpg|jpeg|webp)
function findRef(mod) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const p = path.join(SRC, mod.key + '.' + ext)
    if (fs.existsSync(p)) return { p, mime: ext === 'jpg' ? 'jpeg' : ext }
  }
  return null
}

// per-mod extra art direction layered onto refPrompt (dramatize effects the screenshot can't capture)
const EMBELLISH = {
  GunfireLights: 'DRAMATIZE THE GUNFIRE: add vivid bright muzzle-flash bursts at the squad and tower weapons, glowing hot tracer streaks across the scene, and warm pools of weapon/searchlight light on the ground. Make it an intense night firefight.',
  Flares: 'DRAMATIZE: add brilliant glowing illumination flares hanging in the sky, casting wide dramatic red-amber light cones down through haze onto the dark compound and infected below, faint smoke trails; make the flare glow vivid and ominous against a near-black night.',
  HousePower: 'DRAMATIZE: make house windows glow warm and lit, add chimney smoke, give the powered district a cozy lived-in night glow against the dark.',
  CinematicFX: 'DRAMATIZE: intense cinematic night combat — bright wide tracer streaks crisscrossing the dark, muzzle and explosion flashes, blood spray, demolition dust and impact craters, with forked lightning and storm clouds in the night sky.',
  HighGround: 'DRAMATIZE THE HEIGHT: a towering multi-storey fortified high-rise looming over the ruined city, defenders firing down from the top floors with tracer streaks raining onto infected swarms far below, strong vertical composition emphasising elevation and dominance.',
  ClayPitFixes: 'DRAMATIZE: a working clay quarry / open-pit dig at the edge of the survivor compound, terraced earth and exposed clay strata, workers and a loader, dust haze catching the light, a sense of the land being reclaimed and productive again.',
}

function refPrompt(mod) {
  const extra = EMBELLISH[mod.key]
  return [
    'Here is a real Infection Free Zone gameplay screenshot. PRESERVE this exact scene, isometric camera angle, buildings and layout — do NOT change the composition.',
    `Apply a dramatic, atmospheric cinematic color grade that fits: ${mod.name} — ${(mod.summary || '').trim()}.`,
    'Boost depth, contrast, haze and mood so it reads as polished key art, but it must still look like the actual game.',
    extra || '',
    'REMOVE the in-game HUD: the right-side UI/icon bar, map markers, the "?" fog markers, cursor, selection rings, the yellow path line and any on-screen text. Fill those areas with the underlying scene.',
    `Use ${accent(mod)} as a subtle accent/glow in the lighting.`,
    'Keep the LEFT THIRD darker and visually quiet for a title overlay.',
    'Add NO text, words, letters, numbers, logos or watermark of your own. 16:9 widescreen, full-bleed.',
  ].filter(Boolean).join(' ')
}

async function genArt(mod, outPath) {
  const ref = findRef(mod)
  const reqParts = ref
    ? [{ text: refPrompt(mod) },
       { inlineData: { mimeType: 'image/' + ref.mime, data: fs.readFileSync(ref.p).toString('base64') } }]
    : [{ text: artPrompt(mod) }]
  const body = {
    contents: [{ parts: reqParts }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
  }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const j = await res.json()
  const parts = j?.candidates?.[0]?.content?.parts || []
  const img = parts.find(p => p.inlineData?.data)
  if (!img) throw new Error('no image in response: ' + JSON.stringify(j).slice(0, 300))
  fs.writeFileSync(outPath, Buffer.from(img.inlineData.data, 'base64'))
}

// ---- compose title overlay with ImageMagick ----
function compose(mod, artPath, finalPath, font) {
  const c = accent(mod)
  // short-title overrides for verbose names so the headline stays large
  const TITLE_OVERRIDE = {
    IFZQualityOfLife: 'Quality of Life',
    VehicleSquadSize: 'Vehicle Squads',
  }
  // drop any " - subtitle" tail so the headline stays short & large (e.g. "Hives - Infected Hive Seeding")
  const title = (TITLE_OVERRIDE[mod.key] || (mod.name || mod.key).split(/\s[-–—]\s/)[0]).toUpperCase()
  // tagline = first clean clause (sentence / semicolon). NEVER mid-word truncate:
  // if it won't fit in ~2 lines, drop it entirely.
  let sub = (mod.summary || '').trim()
  const m = sub.match(/^(.*?[.;])\s/)
  if (m) sub = m[1]
  sub = sub.replace(/[.;]\s*$/, '').trim()
  if (sub.length > 130) sub = '' // sanity bound; the real 2-line gate is the measured height below
  const base = path.join(TMP, mod.key + '.base.png')
  const scrim = path.join(TMP, mod.key + '.scrim.png')
  const titleImg = path.join(TMP, mod.key + '.title.png')
  const subImg = path.join(TMP, mod.key + '.sub.png')

  // 1. normalize art -> 1280x720, slight desaturate+contrast for a consistent grade
  execFileSync('magick', [artPath, '-resize', '1280x720^', '-gravity', 'center', '-extent', '1280x720',
    '-modulate', '100,90,100', base])

  // 2. left+bottom dark scrim for text legibility (horizontal gradient, left opaque)
  execFileSync('magick', ['-size', '720x1280', 'gradient:rgba(6,8,13,0.93)-rgba(6,8,13,0)',
    '-rotate', '90', '-resize', '1280x720!', scrim])

  // 3. title (condensed bold, white) and subtitle (lighter) as transparent layers
  //    interword-spacing high so the narrow font keeps a visible gap; clamp width so long names fit.
  // render title; small transparent border prevents tall caps (Anton) from clipping; clamp width to fit canvas
  execFileSync('magick', ['-background', 'none', '-fill', 'white', '-font', font.file,
    '-pointsize', String(font.size), '-interword-spacing', String(font.isp), 'label:' + title,
    '-bordercolor', 'none', '-border', '0x10', '-trim', '+repage',
    '-resize', '1160x>', titleImg])
  if (sub) {
    execFileSync('magick', ['-background', 'none', '-fill', '#c7d0dc', '-font', FONT_SUB,
      '-size', '620x', '-pointsize', '30', 'caption:' + sub, subImg])
    // drop the tagline if it wrapped past 2 lines (keep the header clean, never truncate)
    const subH = parseInt(execFileSync('magick', ['identify', '-format', '%h', subImg]).toString(), 10)
    if (subH > 84) sub = ''
  }

  // 4. measure layers so the tagline sits dynamically below the title (any font height fits)
  const titleH = parseInt(execFileSync('magick', ['identify', '-format', '%h', titleImg]).toString(), 10)
  const TITLE_Y = 296
  const TAB_Y = TITLE_Y - 30
  const SUB_Y = TITLE_Y + titleH + 22

  // 5. composite: base + scrim + accent bar + accent tab + title (+ subtitle if present)
  const args = [base, scrim, '-composite',
    '-fill', c, '-draw', 'rectangle 0,0 12,720',                            // left accent bar
    '-fill', c, '-draw', `rectangle 64,${TAB_Y} 188,${TAB_Y + 12}`,         // accent tab above title
    titleImg, '-gravity', 'NorthWest', '-geometry', '+58+' + TITLE_Y, '-composite']
  if (sub) args.push(subImg, '-gravity', 'NorthWest', '-geometry', '+64+' + SUB_Y, '-composite')
  args.push(finalPath)
  execFileSync('magick', args)
}

// ---- main ----
const args = process.argv.slice(2)
const all = args.includes('--all')
const reuse = args.includes('--reuse')   // re-compose overlay on existing art, no API call
const direct = args.includes('--direct') // use the media-src screenshot AS-IS (no AI) — for UI mods where the UI is the feature
const fontArg = (args.find(a => a.startsWith('--font=')) || '--font=anton').split('=')[1]
const font = FONTS[fontArg] || FONTS.anton
const suffix = (args.find(a => a.startsWith('--suffix=')) || '--suffix=').split('=')[1] // for A/B output names
const keys = (all ? CFG.mods.map(m => m.key) : args).filter(a => !a.startsWith('--'))
if (!keys.length) { console.error('usage: node gen-banners-ai.mjs <ModKey...> | --all'); process.exit(1) }

for (const k of keys) {
  const mod = CFG.mods.find(m => m.key === k)
  if (!mod) { console.error(`  ? unknown mod key: ${k}`); continue }
  const art = path.join(TMP, k + '.art.png')
  const final = path.join(OUT, k + suffix + '.png')
  try {
    let artPath = art
    if (direct) {
      const ref = findRef(mod)
      if (!ref) { console.error(`  ✗ ${k}: --direct needs media-src/${k}.png`); continue }
      artPath = ref.p                // use the screenshot itself, no AI, UI preserved
      process.stdout.write(`${k}: direct (screenshot as-is)...`)
    } else if (reuse && fs.existsSync(art)) {
      process.stdout.write(`${k}: reusing art...`)
    } else {
      process.stdout.write(`${k}: generating art${findRef(mod) ? ' (ref screenshot)' : ''}...`)
      await genArt(mod, art)
    }
    process.stdout.write(' composing...')
    compose(mod, artPath, final, font)
    console.log(` ✓ ${path.relative(HERE, final)}`)
  } catch (e) {
    console.log('')
    console.error(`  ✗ ${k}: ${e.message}`)
  }
}
