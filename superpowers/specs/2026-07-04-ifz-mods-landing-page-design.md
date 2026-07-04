# IFZ Mods Landing Page — Design

**Date:** 2026-07-04
**Status:** Approved (design), pending spec review
**Author brand:** Jay's Desk / JayMade (public alias — no real name anywhere)

## Goal

A single static landing page that presents all **live** IFZ mods as a card grid, links each
to its Nexus page, and offers donation (Ko-fi) + endorsement nudges. Generated from the
canonical `mods.json` so page and Nexus stay in lockstep. Prototypes are excluded automatically
(they are not in `mods.json`).

## Non-goals (YAGNI)

- Search / filter box
- Per-mod detail pages
- Live Ko-fi donation totals or supporter feed (would need a hosted server + Ko-fi webhook)
- Any CMS / framework / build-time dependency beyond Node

## Hosting

GitHub Pages, served from the **`/docs` folder on `main`** of `JaySNL/IFZMods`.
- Zero infra; lives beside the DLLs already pushed to this repo.
- `docs/` already holds unrelated fix `.md`s — the generated `index.html` + `assets/` coexist.
- Publishing is a normal `git push` (outward action — only when the user asks).

## Data source

`tools/nexus-publish/mods.json` is canonical. Relevant fields per mod:
- `key` — matches banner filename `tools/nexus-publish/media/{key}.png`
- `nexusModId` — Nexus URL = `https://www.nexusmods.com/infectionfreezone/mods/{nexusModId}`
- `name`, `summary` — card title + blurb
- `category`, `tags`, `isLibrary`, `version`

All 34 current entries have a `nexusModId` (all live). The one library (`IFZModAPI`,
`isLibrary: true`) is shown but visually set apart (badge / separate row).

## Build

New tool: **`tools/site/build-site.mjs`** (vanilla Node ESM, matches existing `.mjs` tooling,
no npm deps). Steps:

1. Read `../nexus-publish/mods.json`.
2. Copy each `../nexus-publish/media/{key}.png` → `docs/assets/banners/{key}.png`
   (warn + placeholder if a banner is missing).
3. Order mods: **featured first, then alphabetical by `name`.** Featured list is a hand-curated
   array of `key`s at the top of the script (initial: `PerfPack`, `IFZQualityOfLife`,
   `GreenhouseGrow`, `SquadGrenades`, `BlitzHund` — tune freely).
4. Emit `docs/index.html`: self-contained, inline CSS, theme-aware (light/dark via
   `prefers-color-scheme`), no external network fetch (fonts/CSS/JS all inline or local).
5. Idempotent — re-run on every release to refresh cards + counts.

Run: `node tools/site/build-site.mjs` from repo root (or the tool dir).
A `tools/site/AGENTS.md` is added describing the generator + "regenerate on release" rule.

## Page layout

- **Hero:** "Jay's Desk — Infection Free Zone Mods", one-line pitch, live mod count (derived),
  install one-liner linking `INSTALL.md`.
- **Mod grid:** responsive card grid. Each card = banner thumbnail, `name`, `summary`,
  "Get on Nexus" button → mod's Nexus page. Library mod badged. Cards wrap; grid scrolls the
  page vertically only (no horizontal overflow).
- **Donate row:** Ko-fi button → `https://ko-fi.com/jaymade88`; secondary line nudging
  "Endorse on Nexus + enable Donation Points" (external, no page work).
- **Footer:** links — Nexus profile `https://www.nexusmods.com/profile/JaySNL`,
  GitHub `https://github.com/JaySNL`, YouTube `https://www.youtube.com/@jaysdesk`,
  Discord `https://discord.gg/habeKjNdN9` (official IFZ server, modding section).

## Error handling

- Missing banner for a `key` → log a warning, render card with a neutral placeholder tile
  (never crash the build).
- Missing `nexusModId` → skip that mod's Nexus button, still render the card, log a warning.
- Build writes only under `docs/` — never mutates `mods.json` or `media/`.

## Testing / verification

- Run generator, confirm `docs/index.html` + `docs/assets/banners/` produced.
- Open `docs/index.html` locally in a browser: 34 cards, all banners load, all Nexus links
  resolve to the right mod id, Ko-fi + footer links correct, layout has no horizontal scroll,
  dark and light themes both readable.
- No external requests fired (verify offline).

## Constraints carried from repo rules

- Public repo: no secrets in generated output or committed files.
- No real name in bio, page, commits, or metadata — alias only.
- `git push` / GitHub Pages go-live is an outward action — done only when the user asks.
