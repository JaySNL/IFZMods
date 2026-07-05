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
- **CI owns the build.** `.github/workflows/deploy-pages.yml` runs `build-site.mjs` and deploys to
  Pages on every push to `main` touching `mods.json` / `tools/site/**` / `docs/assets/**`. Do NOT
  hand-run the script or hand-edit `index.html` per release — push the `mods.json` change and CI
  regenerates + deploys. Pages source = **GitHub Actions** (not legacy branch). `index.html` is a
  build artifact still committed for convenience; it stays in sync via CI.
- This build is pure deterministic `node` — never route it through Claude or a local LLM. (An LLM's
  only site-related job is drafting `mods.json` prose for a new mod, not building HTML.)
- Run the build locally only to preview/verify: `node tools/site/build-site.mjs`.
- Featured order + fixed links (Ko-fi/Nexus/GitHub/YouTube/Discord) live at the top of `build-site.mjs`.
- No real name anywhere. `git push` / Pages go-live is outward — only when the user asks.
