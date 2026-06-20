#!/usr/bin/env node
// Official Nexus Upload API pipeline — pushes each mod's DLL to its EXISTING mod page.
//
// The Nexus v3 API can create/replace mod FILES but CANNOT create a new mod PAGE.
// Page creation is still the web form (see CHEATSHEET.md / publish.mjs). Once a page exists
// and its numeric ID is in mods.json (nexusModId), this script uploads the DLL to it.
//
// Pipeline per mod (from openapi.yaml):
//   1. GET  /v3/games/{game}/mods/{numericId}        -> resolve opaque mod UID (data.id)
//   2. POST /v3/uploads {size_bytes, filename}        -> {id, presigned_url}
//   3. PUT  <presigned_url>  (raw DLL bytes)          -> S3
//   4. POST /v3/uploads/{id}/finalise                 -> close session
//   5. poll GET /v3/uploads/{id} until state=available
//   6. POST /v3/mod-files {upload_id, mod_id, name, version, file_category:"main"}
//
// Auth: header `apikey: <key>`. Reads key from env NEXUS_API_KEY (never hardcoded/committed).
//
// Usage (CANONICAL — the API route; no browser):
//   node nexus-upload.mjs add auto [key ...]   # add a new file at each mod's mods.json version
//   node nexus-upload.mjs add 1.3.0 PerfPack   # add a new file at an explicit version
//   node nexus-upload.mjs update auto [key ...] # version into an existing API file-update-group
//   (key reads from .env.local NEXUS_API_KEY; no keys = all mods with a nexusModId)
//   Note: `publish.mjs` (Playwright) is ONLY for CREATING a new page; file uploads go through here.
//
// On Windows PowerShell:  $env:NEXUS_API_KEY="..."; node nexus-upload.mjs

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))

// Load .env.local (gitignored) if present, without overwriting an already-set env var.
const envPath = path.join(HERE, '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))

// Preflight guard — catches the two mistakes that have silently mislabeled uploads:
//   (1) duplicate "version" keys in a mod entry (JSON.parse keeps the LAST -> wrong version POSTed),
//   (2) a resolved version that doesn't exist in the DLL bytes (stale build / typo'd bump).
const MODS_RAW = fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8')
function preflight(targets) {
  const problems = []
  const blocks = MODS_RAW.split(/"key":\s*"/).slice(1)
  for (const b of blocks) {
    const key = b.slice(0, b.indexOf('"'))
    const n = (b.slice(0, b.search(/"key":/) >>> 0 || b.length).match(/"version"\s*:/g) || []).length
    if (n > 1) problems.push(`${key}: ${n} duplicate "version" keys in mods.json (JSON keeps the last -> wrong version uploaded)`)
  }
  for (const m of targets) {
    const ver = (!updateVersion || updateVersion === 'auto') ? (m.version || CFG.common.version) : updateVersion
    const dll = path.resolve(HERE, m.dllPath)
    if (!fs.existsSync(dll)) { problems.push(`${m.key}: DLL missing at ${dll}`); continue }
    const buf = fs.readFileSync(dll)
    if (!buf.includes(Buffer.from(ver, 'ascii')) && !buf.includes(Buffer.from(ver, 'utf16le')))
      problems.push(`${m.key}: version ${ver} not found in ${path.basename(dll)} (stale DLL or version mismatch?)`)
  }
  if (problems.length) {
    console.error('[fatal] preflight failed:')
    for (const p of problems) console.error('  - ' + p)
    process.exit(1)
  }
}
const API = 'https://api.nexusmods.com/v3'
const GAME = CFG.game.slug
const KEY = process.env.NEXUS_API_KEY

if (!KEY) {
  console.error('[fatal] NEXUS_API_KEY env var not set.')
  console.error('  PowerShell:  $env:NEXUS_API_KEY="<key>"; node nexus-upload.mjs')
  console.error('  bash:        NEXUS_API_KEY=<key> node nexus-upload.mjs')
  process.exit(1)
}

// Modes:
//   node nexus-upload.mjs [key]                  -> first upload (createModFile)
//   node nexus-upload.mjs update <version> [key] -> new version on existing file (createUpdateGroupVersion)
const isUpdate = process.argv[2] === 'update'
// 'add' is the canonical route: createModFile adds a new file version to an EXISTING page (does NOT
// create a page). 'first' kept as an alias. Use this — web-uploaded pages have no API file-update-
// group, so `update` 404s; `add` is what actually works.
const isFirst  = process.argv[2] === 'first' || process.argv[2] === 'add'
const updateVersion = (isUpdate || isFirst) ? process.argv[3] : null
// One or more keys may follow (update/first mode: argv[4..], bare first-upload mode: argv[2..]).
const keyList = ((isUpdate || isFirst) ? process.argv.slice(4) : process.argv.slice(2)).filter(Boolean)
const keySet = keyList.length ? new Set(keyList) : null
if ((isUpdate || isFirst) && !updateVersion) { console.error(`[fatal] ${process.argv[2]} mode needs a version: node nexus-upload.mjs ${process.argv[2]} 1.1.0 [key ...]`); process.exit(1) }
const H = { apikey: KEY, 'Content-Type': 'application/json' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Nexus / R2 occasionally connect-timeouts under rapid calls. Retry with backoff + a generous
// per-attempt timeout (undici default connect timeout is only 10s).
async function rfetch(url, opts = {}, attempts = 4) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 60_000)
      try {
        return await fetch(url, { ...opts, signal: ctrl.signal })
      } finally {
        clearTimeout(t)
      }
    } catch (e) {
      lastErr = e
      const wait = 2000 * (i + 1)
      console.log(`  …retry ${i + 1}/${attempts} after ${e.cause?.code || e.message} (waiting ${wait}ms)`)
      await sleep(wait)
    }
  }
  throw lastErr
}

async function jget(url) {
  const r = await rfetch(url, { headers: { apikey: KEY } })
  if (!r.ok) throw new Error(`GET ${url} -> ${r.status} ${await r.text()}`)
  return r.json()
}
async function jpost(url, body) {
  const r = await rfetch(url, { method: 'POST', headers: H, body: body ? JSON.stringify(body) : undefined })
  const txt = await r.text()
  if (!r.ok) throw new Error(`POST ${url} -> ${r.status} ${txt}`)
  return txt ? JSON.parse(txt) : {}
}

async function resolveUid(numericId) {
  const res = await jget(`${API}/games/${GAME}/mods/${numericId}`)
  return res.data.id
}

async function uploadFile(dllAbs) {
  const bytes = fs.readFileSync(dllAbs)
  const filename = path.basename(dllAbs)
  // 1. create upload session
  const up = await jpost(`${API}/uploads`, { size_bytes: bytes.length, filename })
  const { id, presigned_url } = up.data
  // 2. PUT raw bytes to presigned R2/S3 URL. The URL signs content-disposition;content-type;host,
  //    so both headers must be present (no apikey — it's a signed URL).
  const put = await rfetch(presigned_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: bytes,
  })
  if (!put.ok) throw new Error(`PUT presigned -> ${put.status} ${await put.text()}`)
  // 3. finalise
  await jpost(`${API}/uploads/${id}/finalise`, null)
  // 4. poll until available
  for (let i = 0; i < 30; i++) {
    const st = await jget(`${API}/uploads/${id}`)
    if (st.data.state === 'available') return id
    await sleep(2000)
  }
  throw new Error(`upload ${id} never reached state=available`)
}

async function pushMod(mod, versionArg) {
  const version = versionArg || mod.version || CFG.common.version
  const dllAbs = path.resolve(HERE, mod.dllPath)
  if (!fs.existsSync(dllAbs)) { console.log(`[skip] ${mod.key} — DLL missing: ${dllAbs}`); return }
  console.log(`\n=== ${mod.key} (mod ${mod.nexusModId}) -> v${version} ===`)
  const uid = await resolveUid(mod.nexusModId)
  console.log(`  uid=${uid}`)
  const uploadId = await uploadFile(dllAbs)
  console.log(`  upload=${uploadId} available`)
  const name = mod.name.replace(/[^a-zA-Z0-9 _'().-]/g, '').slice(0, 50)
  try {
    await jpost(`${API}/mod-files`, {
      upload_id: uploadId,
      mod_id: uid,
      name,
      version,
      file_category: 'main',
      description: mod.summary?.slice(0, 250) || '',
    })
    console.log(`  ✓ created mod file "${name}" v${version}`)
  } catch (e) {
    console.log(`  ✗ createModFile failed (file may already exist — use update-group flow): ${e.message.split('\n')[0]}`)
  }
}

// --- versioned update: add a new version to the mod's existing file update group ---
async function updateMod(mod, version) {
  const dllAbs = path.resolve(HERE, mod.dllPath)
  if (!fs.existsSync(dllAbs)) { console.log(`[skip] ${mod.key} — DLL missing: ${dllAbs}`); return }
  console.log(`\n=== ${mod.key} (mod ${mod.nexusModId}) -> v${version} ===`)
  const uid = await resolveUid(mod.nexusModId)
  const groups = (await jget(`${API}/mods/${uid}/file-update-groups`)).data.groups || []
  if (!groups.length) { console.log(`  ✗ no update groups (was a file ever uploaded? run first-upload mode)`); return }
  const group = groups.find((g) => g.is_active) || groups[0]
  console.log(`  uid=${uid} group=${group.id}${group.name ? ` (${group.name})` : ''}`)
  const uploadId = await uploadFile(dllAbs)
  console.log(`  upload=${uploadId} available`)
  const name = mod.name.replace(/[^a-zA-Z0-9 _'().-]/g, '').slice(0, 50)
  try {
    await jpost(`${API}/mod-file-update-groups/${group.id}/versions`, {
      upload_id: uploadId,
      name,
      version,
      file_category: 'main',
      description: mod.summary?.slice(0, 250) || '',
      archive_existing_file: true,
    })
    console.log(`  ✓ new version "${name}" v${version} (old archived)`)
  } catch (e) {
    console.log(`  ✗ createUpdateGroupVersion failed: ${e.message.split('\n')[0]}`)
  }
}

const targets = CFG.mods.filter((m) => m.nexusModId && (!keySet || keySet.has(m.key)))
if (targets.length === 0) {
  console.error(keySet ? `[fatal] none of [${[...keySet].join(', ')}] have a nexusModId in mods.json` : '[fatal] no mods have a nexusModId yet — create pages first')
  process.exit(1)
}
preflight(targets)
console.log(`${isUpdate ? `Versioning ${targets.length} mod(s) to v${updateVersion}` : `Uploading ${targets.length} mod(s)`} on Nexus (${GAME})...`)
for (const m of targets) {
  // `update auto [keys...]` uploads each mod at its OWN mods.json version (the canonical route)
  const ver = updateVersion === 'auto' ? (m.version || CFG.common.version) : updateVersion
  try { if (isUpdate) await updateMod(m, ver); else await pushMod(m, isFirst ? ver : null) }
  catch (e) { console.log(`[error] ${m.key}: ${e.message.split('\n')[0]}`) }
  await sleep(3000) // gentle pacing
}
console.log('\n[done]')
