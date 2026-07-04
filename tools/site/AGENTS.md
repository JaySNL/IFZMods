# AGENTS.md — tools/site (landing page generator)

Generates the static GitHub Pages landing page for the live IFZ mods.

## What this is
- `render.mjs` — pure functions (esc/nexusUrl/orderMods/renderCard/renderPage + CSS). No I/O. Unit-tested.
- `render.test.mjs` — `node:test`. Run: `node --test tools/site/render.test.mjs` (Node 26: pass the file/glob, a bare dir is read as a module).
- `build-site.mjs` — reads `../nexus-publish/mods.json` + `../nexus-publish/media/{key}.png`,
  writes `docs/index.html` + `docs/assets/banners/`. Run from repo root: `node tools/site/build-site.mjs`.

## Rules
- Zero npm deps — `node:` builtins only. Output makes no external network requests (CSS inline, banners local).
- `mods.json` is canonical and read-only here. Protos are excluded automatically (not in mods.json).
- **Regenerate on every release** so the grid + live count stay in sync, then commit `docs/`.
- Featured order + fixed links (Ko-fi/Nexus/GitHub/YouTube/Discord) live at the top of `build-site.mjs`.
- No real name anywhere. `git push` / Pages go-live is outward — only when the user asks.
