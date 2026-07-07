#!/usr/bin/env node
// Archive stale Nexus files so only the NEWEST file per mod stays MAIN (policy: always keep the
// latest version online; archive the rest unless told to keep a specific set).
//
// The archive action is NOT in the apikey API (see NEXUS-API.md). It's a cookie-gated site route:
//   POST https://next.nexusmods.com/api/flamework/mods/archive-file
//   body {fileId:<v1 file_id>, gameId:7442, modId:<numeric>}   (gameId 7442 = infectionfreezone)
// Cloudflare-JA3-gated -> curl-impersonate + NEXUS_COOKIE (same bypass as media upload).
//
// Usage: node archive-old-files.mjs <Key> [Key ...]        (dry run, lists what it WOULD archive)
//        node archive-old-files.mjs --send <Key> [Key ...]  (actually archive)
// Keys are mods.json keys (e.g. PerfPack IFZQualityOfLife SmartWorkerRedist).
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const HERE = path.dirname(fileURLToPath(import.meta.url))
for (const l of (fs.existsSync(path.join(HERE, '.env.local')) ? fs.readFileSync(path.join(HERE, '.env.local'), 'utf8').split('\n') : []))
  { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') }

const GAME = 'infectionfreezone', GAME_ID = 7442
const API_KEY = process.env.NEXUS_API_KEY, COOKIE = process.env.NEXUS_COOKIE, UA = process.env.NEXUS_UA
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))
const MODS = Array.isArray(CFG) ? CFG : CFG.mods

const args = process.argv.slice(2)
const SEND = args.includes('--send')
const keys = args.filter(a => a !== '--send')
if (!keys.length) { console.error('usage: node archive-old-files.mjs [--send] <Key> [Key ...]'); process.exit(1) }
if (!API_KEY || !COOKIE) { console.error('[fatal] NEXUS_API_KEY + NEXUS_COOKIE required in .env.local'); process.exit(1) }

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function listFiles(modId) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(`https://api.nexusmods.com/v1/games/${GAME}/mods/${modId}/files.json`, { headers: { apikey: API_KEY } })
    if (r.ok) return (await r.json()).files || []
    if (r.status === 403 || r.status === 429) { await sleep(1500 * (attempt + 1)); continue } // rate-limit backoff
    throw new Error(`files.json ${modId} -> ${r.status}`)
  }
  throw new Error(`files.json ${modId} -> rate-limited after retries`)
}

function archive(modId, fileId) {
  const out = execFileSync('/usr/bin/curl-impersonate', [
    '--impersonate', 'firefox147', '--compressed', '-s',
    '-X', 'POST', 'https://next.nexusmods.com/api/flamework/mods/archive-file',
    '-H', `User-Agent: ${UA}`, '-H', `Cookie: ${COOKIE}`, '-H', 'Content-Type: application/json',
    '-H', 'Origin: https://www.nexusmods.com', '-H', 'Referer: https://www.nexusmods.com/',
    '--data', JSON.stringify({ fileId, gameId: GAME_ID, modId }),
  ], { encoding: 'utf8' })
  return out.trim()
}

let totalArchived = 0, errors = 0
for (const key of keys) {
  const mod = MODS.find(m => m.key === key)
  if (!mod?.nexusModId) { console.log(`[skip] ${key} — no nexusModId`); continue }
  const modId = mod.nexusModId
  try {
    const files = await listFiles(modId)
    const main = files.filter(f => f.category_name === 'MAIN')
      .sort((a, b) => new Date(b.uploaded_time) - new Date(a.uploaded_time))
    if (main.length <= 1) { console.log(`=== ${key} (mod ${modId}) — ${main.length} MAIN, ok ===`); await sleep(300); continue }
    const keep = main[0], stale = main.slice(1)
    console.log(`\n=== ${key} (mod ${modId}) — KEEP ${keep.file_id} v${keep.version} ${keep.file_name.slice(-10)} ===`)
    for (const f of stale) {
      if (!SEND) { console.log(`  would archive ${f.file_id} v${f.version} ${f.file_name.slice(-10)}`); continue }
      let res; try { res = archive(modId, f.file_id) } catch (e) { res = 'ERR ' + e.message }
      const ok = /success/i.test(res); if (ok) totalArchived++; else errors++
      console.log(`  ${ok ? 'archived' : 'FAILED '} ${f.file_id} v${f.version} ${f.file_name.slice(-10)} -> ${res}`)
      await sleep(600) // throttle the site endpoint
    }
  } catch (e) { errors++; console.log(`[error] ${key} (mod ${modId}): ${e.message}`) }
  await sleep(400) // throttle v1 between mods
}
console.log(SEND ? `\n[done] archived ${totalArchived}, errors ${errors}` : '\n[dry run] re-run with --send to archive.')
