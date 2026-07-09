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
//   3. PUT  <presigned_url>  (ZIPPED bytes)           -> S3   (auto-zipped: see packForUpload —
//        a bare .dll gets auto-quarantined by Nexus; a real archive it can preview passes)
//   4. POST /v3/uploads/{id}/finalise                 -> close session
//   5. poll GET /v3/uploads/{id} until state=available
//   6. POST /v3/mod-files {upload_id, mod_id, name, version, file_category:"main"}
//
// Auth: header `apikey: <key>`. Reads key from env NEXUS_API_KEY (never hardcoded/committed).
//
// AN ACTION VERB IS MANDATORY — there is NO bare mode. A bare/verb-less call used to upload every mod
// (created 6 accidental dup files, 2026-07-09); it now refuses. To just LOOK, use `list` (read-only).
//
// Usage (CANONICAL — the API route; no browser):
//   node nexus-upload.mjs list [key ...]        # READ-ONLY: show each mod's Nexus files (NO upload)
//   node nexus-upload.mjs add auto [key ...]    # add a new file at each mod's mods.json version
//   node nexus-upload.mjs add 1.3.0 PerfPack    # add a new file at an explicit version
//   node nexus-upload.mjs update auto [key ...]  # version into an existing API file-update-group
//   (key reads from .env.local NEXUS_API_KEY; no keys = all mods with a nexusModId)
//   Prefer `publish-all.mjs --send <Key>` (dry-run unless --send) for a full release; this is the raw file step.
//   Note: `publish.mjs` (Playwright) is ONLY for CREATING a new page; file uploads go through here.
//
// On Windows PowerShell:  $env:NEXUS_API_KEY="..."; node nexus-upload.mjs list

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import os from 'node:os'
import { execFileSync } from 'node:child_process'

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

// Preflight guard — catches the mistakes that have silently mislabeled uploads:
//   (1) duplicate TOP-LEVEL keys in a mod entry (JSON.parse keeps the LAST -> wrong value POSTed).
//       Happens when two editors each add the same key (bit us on "version" AND "fileNotes").
//   (2) a resolved version that doesn't exist in the DLL bytes (stale build / typo'd bump).
const MODS_RAW = fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8')
// Top-level, scalar keys only — none of these appear inside the nested "sections" object, so a plain
// per-entry occurrence count can't false-positive on a nested key of the same name.
const DUP_CHECK_KEYS = ['nexusModId', 'version', 'dllPath', 'name', 'summary', 'fileNotes', 'category']
function preflight(targets) {
  const problems = []
  const blocks = MODS_RAW.split(/"key":\s*"/).slice(1)
  for (const b of blocks) {
    const key = b.slice(0, b.indexOf('"'))
    const scope = b.slice(0, b.search(/"key":/) >>> 0 || b.length) // this entry only
    for (const k of DUP_CHECK_KEYS) {
      const n = (scope.match(new RegExp(`"${k}"\\s*:`, 'g')) || []).length
      if (n > 1) problems.push(`${key}: ${n} duplicate "${k}" keys in mods.json (JSON keeps the last -> wrong value uploaded)`)
    }
  }
  for (const m of targets) {
    const ver = (!updateVersion || updateVersion === 'auto') ? (m.version || CFG.common.version) : updateVersion
    const dll = path.resolve(HERE, m.dllPath)
    if (!fs.existsSync(dll)) { problems.push(`${m.key}: DLL missing at ${dll}`); continue }
    const buf = fs.readFileSync(dll)
    const dllVer = ver.split('-')[0]  // strip pre-release suffix (e.g. -beta) — Nexus label may differ from assembly ver
    if (!buf.includes(Buffer.from(dllVer, 'ascii')) && !buf.includes(Buffer.from(dllVer, 'utf16le')))
      problems.push(`${m.key}: version ${dllVer} not found in ${path.basename(dll)} (stale DLL or version mismatch?)`)
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

// ACTION VERB IS MANDATORY. Every mutating path here creates a REAL live file on a mod page — there is
// NO bare/implicit mode. (History: the old code treated argv[2] directly as a mod key when it wasn't a
// verb, so `nexus-upload.mjs list Foo` uploaded Foo, and a bare `nexus-upload.mjs` uploaded EVERY mod —
// this created 6 accidental duplicate files across live mod pages, 2026-07-09.) An unrecognized or
// missing verb now REFUSES and exits without touching Nexus. Read-only inspection goes through `list`.
const ACTION = process.argv[2]
const VALID_ACTIONS = new Set(['add', 'first', 'update', 'list'])
if (!VALID_ACTIONS.has(ACTION)) {
  console.error('[fatal] nexus-upload.mjs performs REAL uploads — there is no bare/implicit mode.')
  console.error('  An explicit action is required (a stray arg is NOT treated as a mod key):')
  console.error('    list                       READ-ONLY: show each mod\'s Nexus files (no upload)')
  console.error('    add    auto|<ver> [key…]   add a new file at the mods.json (auto) or given version')
  console.error('    update auto|<ver> [key…]   new version in the existing file-update group')
  console.error('  (no keys = all mods with a nexusModId).  To just look, use: node nexus-upload.mjs list [key…]')
  process.exit(1)
}
const isList   = ACTION === 'list'
// 'add' is the canonical route: createModFile adds a new file version to an EXISTING page (does NOT
// create a page). 'first' kept as an alias. Use this — web-uploaded pages have no API file-update-
// group, so `update` 404s; `add` is what actually works.
const isUpdate = ACTION === 'update'
const isFirst  = ACTION === 'first' || ACTION === 'add'
const updateVersion = (isUpdate || isFirst) ? process.argv[3] : null
// Keys follow the verb: list -> argv[3..]; add/update -> argv[4..] (after the version).
const keyList = (isList ? process.argv.slice(3) : process.argv.slice(4)).filter(Boolean)
const keySet = keyList.length ? new Set(keyList) : null
if ((isUpdate || isFirst) && !updateVersion) { console.error(`[fatal] ${ACTION} mode needs a version: node nexus-upload.mjs ${ACTION} auto [key ...]`); process.exit(1) }
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

// Archive the DLL before upload. A BARE .dll upload gets auto-QUARANTINED on Nexus (the scanner
// "fails to preview archive contents" for a raw PE, holds the file even at 0/70 VirusTotal).
// A plain ZIP wrapping a single DLL ALSO gets quarantined (observed on PerfPack 1.5.4, 2026-07-07);
// a real .7z container previews clean and passes. So we emit .7z (p7zip). We wrap into
// BepInEx/plugins/<dll> so Vortex/MO2 install to the right path. Preflight already validated the
// version against the RAW dll, so compression here is irrelevant. Non-.dll dllPath (already an
// archive) is uploaded as-is.
function makeArchive(stageDir, outPath) {
  if (fs.existsSync(outPath)) fs.rmSync(outPath)
  // Real 7z container (-t7z). Zip is deliberately NOT used — Nexus quarantines single-DLL zips.
  const attempts = [
    ['7z',  ['a', '-t7z', '-bso0', '-bsp0', outPath, 'BepInEx']],
    ['7za', ['a', '-t7z', '-bso0', '-bsp0', outPath, 'BepInEx']],
    ['7zr', ['a', '-t7z', '-bso0', '-bsp0', outPath, 'BepInEx']],
  ]
  let lastErr
  for (const [bin, args] of attempts) {
    try { execFileSync(bin, args, { cwd: stageDir, stdio: 'ignore' }); return bin }
    catch (e) { lastErr = e; if (fs.existsSync(outPath)) fs.rmSync(outPath) }
  }
  throw new Error(`no 7z archiver on PATH (install p7zip): ${lastErr?.message || ''}`)
}

function packForUpload(fileAbs, key, version) {
  if (!fileAbs.toLowerCase().endsWith('.dll'))
    return { fileAbs, filename: path.basename(fileAbs), archiver: '(pre-archived)', cleanup() {} }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ifz-pack-'))
  const stage = path.join(tmp, 'stage')
  const plugins = path.join(stage, 'BepInEx', 'plugins')
  fs.mkdirSync(plugins, { recursive: true })
  fs.copyFileSync(fileAbs, path.join(plugins, path.basename(fileAbs)))
  const safe = `${key}-${version}`.replace(/[^A-Za-z0-9._-]/g, '_')
  const outPath = path.join(tmp, `${safe}.7z`)
  const archiver = makeArchive(stage, outPath)
  return {
    fileAbs: outPath,
    filename: `${safe}.7z`,
    archiver,
    cleanup() { try { fs.rmSync(tmp, { recursive: true, force: true }) } catch {} },
  }
}

async function uploadFile(fileAbs, filename) {
  const bytes = fs.readFileSync(fileAbs)
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
  const pkg = packForUpload(dllAbs, mod.key, version)
  console.log(`  packed ${pkg.filename} via ${pkg.archiver}`)
  let uploadId
  try { uploadId = await uploadFile(pkg.fileAbs, pkg.filename) } finally { pkg.cleanup() }
  console.log(`  upload=${uploadId} available`)
  const name = mod.name.replace(/[^a-zA-Z0-9 _'().-]/g, '').slice(0, 50)
  try {
    await jpost(`${API}/mod-files`, {
      upload_id: uploadId,
      mod_id: uid,
      name,
      version,
      file_category: 'main',
      description: (mod.fileNotes || mod.summary || '').slice(0, 255),
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
  const pkg = packForUpload(dllAbs, mod.key, version)
  console.log(`  packed ${pkg.filename} via ${pkg.archiver}`)
  let uploadId
  try { uploadId = await uploadFile(pkg.fileAbs, pkg.filename) } finally { pkg.cleanup() }
  console.log(`  upload=${uploadId} available`)
  const name = mod.name.replace(/[^a-zA-Z0-9 _'().-]/g, '').slice(0, 50)
  try {
    await jpost(`${API}/mod-file-update-groups/${group.id}/versions`, {
      upload_id: uploadId,
      name,
      version,
      file_category: 'main',
      description: (mod.fileNotes || mod.summary || '').slice(0, 255),
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

// READ-ONLY: list each mod's live Nexus files (v1 files.json). No preflight, no upload — this is the
// safe way to inspect file IDs / versions before deciding to `add`.
if (isList) {
  for (const m of targets) {
    try {
      const j = await jget(`https://api.nexusmods.com/v1/games/${GAME}/mods/${m.nexusModId}/files.json`)
      const files = (j.files || []).sort((a, b) => new Date(b.uploaded_time) - new Date(a.uploaded_time))
      console.log(`\n=== ${m.key} (mod ${m.nexusModId}) — ${files.length} file(s) ===`)
      for (const f of files) console.log(`  ${(f.category_name || 'ARCHIVED').padEnd(8)} file ${f.file_id}  v${f.version}  ${f.file_name}`)
    } catch (e) { console.log(`[error] ${m.key}: ${e.message.split('\n')[0]}`) }
    await sleep(300)
  }
  console.log('\n[done] list — READ-ONLY, no uploads performed.')
  process.exit(0)
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
