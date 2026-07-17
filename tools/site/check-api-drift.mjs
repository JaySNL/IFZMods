#!/usr/bin/env node
// Flags API-doc drift by comparing the CURRENT dev-repo source surface (hooks / options / calls
// / types) against the baseline captured at the last refresh (tools/site/api/<Key>.surface.json).
// It reports ADDED and REMOVED names since that baseline — i.e. exactly the "new hook/option was
// added, docs need updating" case. Heuristic (regex over source), so treat as a nudge, not proof.
//
// LOCAL ONLY: needs the private dev repo (API source). Exits 1 on drift, 0 if clean.
// Usage: node tools/site/check-api-drift.mjs   [IFZ_DEV_REPO=/path]
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { apiSurface } from './api-surface.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const reg = JSON.parse(readFileSync(join(here, 'api-registry.json'), 'utf8'));
const devRepo = process.env.IFZ_DEV_REPO
  ? resolve(process.env.IFZ_DEV_REPO)
  : resolve(repoRoot, reg.devRepoDefault);

let drift = false;
console.log(`dev repo: ${devRepo}\n`);
for (const api of reg.apis) {
  const srcDir = join(devRepo, api.dir);
  const basePath = join(here, 'api', `${api.key}.surface.json`);
  if (!existsSync(srcDir)) { console.log(`skip  ${api.key}: source dir not found (${srcDir})`); continue; }
  const current = apiSurface(srcDir);
  if (!existsSync(basePath)) {
    console.log(`DRIFT ${api.key}: no baseline — run refresh-api-docs.sh ${api.key} to capture one`);
    drift = true; continue;
  }
  const base = new Set(JSON.parse(readFileSync(basePath, 'utf8')));
  const cur = new Set(current);
  const added = current.filter((n) => !base.has(n));
  const removed = [...base].filter((n) => !cur.has(n)).sort();
  if (added.length || removed.length) {
    drift = true;
    console.log(`DRIFT ${api.key}:`
      + (added.length ? ` +${added.length} new (${added.slice(0, 10).join(', ')})` : '')
      + (removed.length ? ` -${removed.length} gone (${removed.slice(0, 10).join(', ')})` : ''));
  } else {
    console.log(`ok    ${api.key}: surface unchanged since last refresh (${current.length} tracked)`);
  }
}
if (drift) {
  console.log('\nDocs may be stale. Refresh:  tools/site/refresh-api-docs.sh <Key|all>');
  process.exit(1);
}
console.log('\nAll API docs current.');
