#!/usr/bin/env bash
# Refresh the API reference JSON(s) that feed docs/api.html, via a local qwen grunt.
#
# LOCAL ONLY — this cannot run in GitHub CI: it needs the PRIVATE dev repo (API source, never
# pushed) and the local mlx grunt bus. Run it on the dev machine when hooks/options are added.
#
# Usage:  tools/site/refresh-api-docs.sh <Key|all>
#         IFZ_DEV_REPO=/path/to/IFZ-Modding tools/site/refresh-api-docs.sh all
#
# For each API it: dispatches a grunt to re-extract the public surface -> <dir>/_apidoc.json,
# auto-verifies a sample of signatures against source (hallucination guard), stages the JSON,
# then rebuilds the site. It does NOT commit — review docs/api.html, then commit yourself.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
DIST="$(cd "$HERE/../.." && pwd)"
REG="$HERE/api-registry.json"
[ -f "$REG" ] || { echo "ERROR: missing $REG" >&2; exit 1; }

DEV="${IFZ_DEV_REPO:-$DIST/$(node -e "console.log(require('$REG').devRepoDefault)")}"
DEV="$(cd "$DEV" 2>/dev/null && pwd || true)"
[ -n "$DEV" ] && [ -d "$DEV/.git" ] || { echo "ERROR: dev repo not found (set IFZ_DEV_REPO)" >&2; exit 1; }
[ -d "$DEV/.team" ] || { echo "ERROR: no team bus in $DEV — run /teamup there first" >&2; exit 1; }

TARGET="${1:-}"; [ -n "$TARGET" ] || { echo "usage: $0 <Key|all>" >&2; exit 1; }
KEYS="$(node -e "const r=require('$REG');const t=process.argv[1];const ks=t==='all'?r.apis.map(a=>a.key):[t];console.log(ks.join(' '))" "$TARGET")"

# pick a grunt with a LIVE tmux pane (rostered grunts can die); else spawn a fresh one
roster_grunts() { python3 -c "import json;r=json.load(open('$DEV/.team/roster.json'));print(' '.join(k for k in r if k!='lead'))" 2>/dev/null; }
pane_of() { python3 -c "import json;print(json.load(open('$DEV/.team/roster.json')).get('$1',{}).get('pane',''))" 2>/dev/null; }
cwd_of()  { python3 -c "import json;print(json.load(open('$DEV/.team/roster.json')).get('$1',{}).get('cwd',''))" 2>/dev/null; }
GR=""
for g in $(roster_grunts); do
  if tmux list-panes -a -F '#{pane_id}' 2>/dev/null | grep -qx "$(pane_of "$g")"; then GR="$g"; break; fi
done
if [ -z "$GR" ]; then GR="$(team --root "$DEV" grunt add 2>&1 | grep -oE 'grunt[0-9]+' | head -1)"; fi
[ -n "$GR" ] || { echo "ERROR: could not obtain a grunt on the dev bus" >&2; exit 1; }
WT="$(cwd_of "$GR")"
echo "dev repo: $DEV   grunt: $GR"

for KEY in $KEYS; do
  META="$(node -e "const a=require('$REG').apis.find(x=>x.key===process.argv[1]);if(!a)process.exit(3);console.log(a.dir+'\t'+a.dll)" "$KEY")" \
    || { echo "ERROR: '$KEY' not in registry" >&2; exit 1; }
  DIR="${META%%$'\t'*}"; DLL="${META##*$'\t'}"
  echo "== refresh $KEY  (source $DEV/$DIR) =="
  rm -f "$DEV/$DIR/_apidoc.json" "$WT/$DIR/_apidoc.json" 2>/dev/null || true
  sed -e "s/@KEY@/$KEY/g" -e "s/@DLL@/$DLL/g" -e "s/@DIR@/$DIR/g" "$HERE/api/_extract.template.md" > "$WT/_extract.md"

  OUT="$(team --root "$DEV" send "$GR" --type build --create "$DIR/_apidoc.json" \
    --question "Read ./_extract.md in your cwd and execute it: read $DIR/*.cs (skip obj/bin), extract the PUBLIC API surface, write valid JSON to $DIR/_apidoc.json per the schema. Faithful signatures only. Reply path + type count.")"
  TID="$(echo "$OUT" | grep -oE 'task [0-9]+' | grep -oE '[0-9]+' | head -1)"
  [ -n "$TID" ] || { echo "  ERROR: dispatch failed: $OUT" >&2; exit 1; }
  echo "  task $TID dispatched; waiting (<=15m)..."
  team --root "$DEV" wait --task "$TID" --timeout 900 || true

  # grunts sometimes write to the main tree instead of the worktree
  F=""; for c in "$WT/$DIR/_apidoc.json" "$DEV/$DIR/_apidoc.json"; do [ -f "$c" ] && F="$c" && break; done
  [ -n "$F" ] || { echo "  FAIL: $KEY produced no JSON — re-run this command" >&2; exit 1; }
  node -e "const a=require('$F');const r=a.reference||{};if(a.key!==process.argv[1]||!a.version||!Array.isArray(a.types)||!r.bepInDependency||!r.hintPath)throw new Error('bad JSON shape — missing key/version/types/reference{bepInDependency,hintPath}');console.log('  valid JSON:',a.types.length,'types')" "$KEY"

  # hallucination guard: sample signature identifiers must exist in source
  IDS="$(mktemp)"
  node -e 'const a=require(process.argv[1]);const s=[];for(const t of a.types){for(const m of(t.members||[]))s.push(m.signature);for(const h of(t.hooks||[]))s.push(h.signature);}for(const x of s){const id=(x.match(/([A-Za-z_]\w+)\s*[(<]/)||x.match(/\b([A-Z][A-Za-z0-9_]+)\b/)||[])[1];if(id)console.log(id);}' "$F" | sort -u | head -30 > "$IDS"
  MISS=0; TOT=0
  while read -r id; do [ -n "$id" ] || continue; TOT=$((TOT+1)); grep -rqw "$id" "$DEV/$DIR" --include='*.cs' 2>/dev/null || MISS=$((MISS+1)); done < "$IDS"
  rm -f "$IDS"
  echo "  verify: $MISS/$TOT sampled identifiers missing from source"
  [ "$TOT" -gt 0 ] && [ "$MISS" -le $((TOT/5+1)) ] || { echo "  FAIL: too many signatures not in source — likely hallucination, NOT staging $KEY" >&2; exit 1; }

  cp "$F" "$HERE/api/$KEY.json"
  node --input-type=module -e "import { apiSurface } from '$HERE/api-surface.mjs'; import { writeFileSync } from 'node:fs'; writeFileSync('$HERE/api/$KEY.surface.json', JSON.stringify(apiSurface('$DEV/$DIR')) + '\n');"
  rm -f "$F" "$WT/_extract.md"
  echo "  staged tools/site/api/$KEY.json + surface baseline"
done

echo "== rebuild + test =="
node --test "$HERE/render.test.mjs" >/dev/null 2>&1 && echo "  tests ok" || { echo "  tests FAILED" >&2; exit 1; }
node "$HERE/build-site.mjs"
echo
echo "Done. Review docs/api.html, then commit:"
echo "  git add tools/site/api/ docs/api.html docs/index.html && git commit -m 'docs(site): refresh API reference'"
