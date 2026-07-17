// Shared surface extractor used by both check-api-drift.mjs and refresh-api-docs.sh.
// The "surface" = the modder-facing bits whose ADDITION means the docs need refreshing:
// hooks (events / Action callbacks), options (ConfigEntry fields), public methods (calls),
// and public types. Deliberately NOT every public property/getter — those are summarized in
// the docs, so tracking them would be pure noise. Returns a sorted, de-duped string[].
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function walkCs(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'obj' || e.name === 'bin') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkCs(p));
    else if (e.name.endsWith('.cs')) out.push(p);
  }
  return out;
}

export function apiSurface(dir) {
  const names = new Set();
  for (const f of walkCs(dir)) {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      if (!/\bpublic\b/.test(line)) continue;
      let m;
      if ((m = line.match(/\bpublic\b[^;{]*\bevent\b[^;{]*?\b([A-Za-z_]\w+)\s*(?:;|=|\{)/))) { names.add(m[1]); continue; }
      if ((m = line.match(/\bpublic\b[^;{=]*\bAction[<\s][^;{=]*?\b([A-Za-z_]\w+)\s*(?:;|=)/))) { names.add(m[1]); continue; }
      if ((m = line.match(/\bConfigEntry<[^>]*>\s+([A-Za-z_]\w+)/))) { names.add(m[1]); continue; }
      if ((m = line.match(/\bpublic\b[^=]*\b(?:class|struct|enum)\s+([A-Za-z_]\w+)/))) { names.add(m[1]); continue; }
      if ((m = line.match(/\bpublic\b[^=;(]*?\b([A-Z][A-Za-z0-9_]+)\s*\(/))) names.add(m[1]);
    }
  }
  return [...names].sort();
}
