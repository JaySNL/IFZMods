# IFZ Mods Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a self-contained static GitHub Pages landing page for the live IFZ mods from `mods.json`.

**Architecture:** Pure render functions (URL/order/HTML string builders, no I/O) live in `tools/site/render.mjs` and are unit-tested with `node:test`. A thin orchestrator `tools/site/build-site.mjs` reads `mods.json`, copies banners into `docs/assets/banners/`, and writes `docs/index.html`. GitHub Pages serves `/docs` on `main`.

**Tech Stack:** Node.js (ESM), `node:` builtins only (`node:fs`, `node:path`, `node:url`, `node:test`, `node:assert`). No npm dependencies, no framework.

## Global Constraints

- Node ESM (`.mjs`), **zero npm dependencies** — `node:` builtins only.
- Generated `index.html` makes **no external network requests**: all CSS inline in a `<style>` tag, no `<link rel=stylesheet>`, no `<script src>`, banners are local under `assets/banners/`.
- **No real name** anywhere (page, code, commits) — public alias only: **Jay's Desk / JayMade**.
- Public repo: **never** commit secrets; the generator reads only `mods.json` + `media/`, writes only under `docs/`.
- Canonical data: `tools/nexus-publish/mods.json` (34 live mods; game slug `infectionfreezone`). Never mutate it.
- Fixed metadata values (copy verbatim):
  - Ko-fi: `https://ko-fi.com/jaymade88`
  - Nexus profile: `https://www.nexusmods.com/profile/JaySNL`
  - GitHub: `https://github.com/JaySNL`
  - YouTube: `https://www.youtube.com/@jaysdesk`
  - Discord: `https://discord.gg/habeKjNdN9`
  - Install guide: `https://github.com/JaySNL/IFZMods/blob/main/INSTALL.md`
  - Featured keys (order matters): `['PerfPack', 'IFZQualityOfLife', 'GreenhouseGrow', 'SquadGrenades', 'BlitzHund']`
- `git push` / GitHub Pages go-live is outward-facing — only when the user asks.

## File Structure

- `tools/site/render.mjs` — pure functions: `esc`, `nexusUrl`, `orderMods`, `renderCard`, `renderPage`, `CSS` constant. No I/O.
- `tools/site/render.test.mjs` — `node:test` unit tests for the pure functions.
- `tools/site/build-site.mjs` — orchestrator: read JSON, copy banners, write `docs/index.html`.
- `tools/site/AGENTS.md` — describes the generator + "regenerate on release" rule.
- Outputs (generated, committed): `docs/index.html`, `docs/assets/banners/{key}.png`.

Run the generator from repo root: `node tools/site/build-site.mjs`
Run tests: `node --test tools/site/`

---

### Task 1: Render helpers — `esc`, `nexusUrl`, `orderMods`

**Files:**
- Create: `tools/site/render.mjs`
- Test: `tools/site/render.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `esc(s: string) -> string` — HTML-escapes `& < > "`.
  - `nexusUrl(mod: {nexusModId}, gameSlug: string) -> string`
  - `orderMods(mods: Mod[], featuredKeys: string[]) -> Mod[]` — featured in `featuredKeys` order first, remainder sorted alpha by `name`.

- [ ] **Step 1: Write the failing test**

Create `tools/site/render.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, nexusUrl, orderMods } from './render.mjs';

test('esc escapes html-significant characters', () => {
  assert.equal(esc('a & b <c> "d"'), 'a &amp; b &lt;c&gt; &quot;d&quot;');
});

test('nexusUrl builds mod url from slug + id', () => {
  assert.equal(
    nexusUrl({ nexusModId: 42 }, 'infectionfreezone'),
    'https://www.nexusmods.com/infectionfreezone/mods/42',
  );
});

test('orderMods puts featured first in given order, rest alpha by name', () => {
  const mods = [
    { key: 'b', name: 'Bravo' },
    { key: 'a', name: 'Alpha' },
    { key: 'feat2', name: 'Zeta' },
    { key: 'feat1', name: 'Yankee' },
  ];
  const out = orderMods(mods, ['feat1', 'feat2']);
  assert.deepEqual(out.map((m) => m.key), ['feat1', 'feat2', 'a', 'b']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tools/site/`
Expected: FAIL — cannot find module `./render.mjs` (or export missing).

- [ ] **Step 3: Write minimal implementation**

Create `tools/site/render.mjs`:

```js
export function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
}

export function nexusUrl(mod, gameSlug) {
  return `https://www.nexusmods.com/${gameSlug}/mods/${mod.nexusModId}`;
}

export function orderMods(mods, featuredKeys) {
  const rank = new Map(featuredKeys.map((k, i) => [k, i]));
  const featured = [];
  const rest = [];
  for (const m of mods) (rank.has(m.key) ? featured : rest).push(m);
  featured.sort((a, b) => rank.get(a.key) - rank.get(b.key));
  rest.sort((a, b) => a.name.localeCompare(b.name));
  return [...featured, ...rest];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tools/site/`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add tools/site/render.mjs tools/site/render.test.mjs
git commit -m "feat(site): add esc/nexusUrl/orderMods render helpers"
```

---

### Task 2: Card + page renderers — `renderCard`, `renderPage`, `CSS`

**Files:**
- Modify: `tools/site/render.mjs` (append `CSS`, `renderCard`, `renderPage`)
- Test: `tools/site/render.test.mjs` (append tests)

**Interfaces:**
- Consumes: `esc`, `nexusUrl`, `orderMods` from Task 1.
- Produces:
  - `renderCard(mod, gameSlug: string) -> string` — one `<article class="card">`. Banner `assets/banners/{key}.png`, escaped `name`/`summary`, "Get on Nexus" button only when `mod.nexusModId` truthy, `Library` badge when `mod.isLibrary`.
  - `renderPage({ mods, gameSlug, featuredKeys, meta }) -> string` — full standalone `<!doctype html>` document. `meta` = `{ kofi, nexusProfile, github, youtube, discord, installDoc }`. Hero shows live count (`mods.length`), grid uses `orderMods`, inline `CSS`, no external assets.
  - `CSS` — string constant, theme-aware via `prefers-color-scheme`.

- [ ] **Step 1: Write the failing tests**

Append to `tools/site/render.test.mjs`:

```js
import { renderCard, renderPage } from './render.mjs';

test('renderCard includes name, summary, lazy banner, and nexus link', () => {
  const html = renderCard(
    { key: 'PerfPack', name: 'Perf Pack', summary: 'Faster late game', nexusModId: 50 },
    'infectionfreezone',
  );
  assert.match(html, /assets\/banners\/PerfPack\.png/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /Perf Pack/);
  assert.match(html, /Faster late game/);
  assert.match(html, /mods\/50/);
  assert.match(html, /Get on Nexus/);
});

test('renderCard badges a library and escapes html', () => {
  const html = renderCard(
    { key: 'IFZModAPI', name: 'API & <lib>', summary: 'x', nexusModId: 42, isLibrary: true },
    'infectionfreezone',
  );
  assert.match(html, /class="badge"/);
  assert.match(html, /API &amp; &lt;lib&gt;/);
});

test('renderCard omits nexus button when no id', () => {
  const html = renderCard({ key: 'x', name: 'X', summary: 'y' }, 'infectionfreezone');
  assert.doesNotMatch(html, /Get on Nexus/);
});

test('renderPage is standalone, counts mods, orders featured first, wires links', () => {
  const mods = [
    { key: 'a', name: 'Alpha', summary: 's', nexusModId: 1 },
    { key: 'b', name: 'Bravo', summary: 's', nexusModId: 2 },
  ];
  const meta = {
    kofi: 'https://ko-fi.com/jaymade88',
    nexusProfile: 'https://www.nexusmods.com/profile/JaySNL',
    github: 'https://github.com/JaySNL',
    youtube: 'https://www.youtube.com/@jaysdesk',
    discord: 'https://discord.gg/habeKjNdN9',
    installDoc: 'https://github.com/JaySNL/IFZMods/blob/main/INSTALL.md',
  };
  const html = renderPage({ mods, gameSlug: 'infectionfreezone', featuredKeys: ['b'], meta });
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /2 free mods/);
  assert.match(html, /ko-fi\.com\/jaymade88/);
  assert.match(html, /@jaysdesk/);
  assert.match(html, /discord\.gg\/habeKjNdN9/);
  assert.match(html, /profile\/JaySNL/);
  assert.ok(html.indexOf('Bravo') < html.indexOf('Alpha')); // featured 'b' before 'a'
  assert.doesNotMatch(html, /<link[^>]+rel=["']?stylesheet/i); // no external CSS
  assert.doesNotMatch(html, /<script\s+src=/i); // no external JS
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tools/site/`
Expected: FAIL — `renderCard` / `renderPage` not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `tools/site/render.mjs`:

```js
export const CSS = `
:root {
  --bg: #f6f7f9; --fg: #1a1c1f; --muted: #5c636e; --card: #ffffff;
  --line: #e2e5ea; --tile: #d9dee6; --accent: #d1495b; --accent-fg: #ffffff;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #14161a; --fg: #e8eaed; --muted: #9aa2ad; --card: #1e2127;
    --line: #2c313a; --tile: #2c313a; --accent: #e0637a; --accent-fg: #14161a;
  }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg);
  font: 16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
a { color: inherit; }
.hero { max-width: 1100px; margin: 0 auto; padding: 3rem 1.25rem 1.5rem; text-align: center; }
.hero h1 { margin: 0 0 .25rem; font-size: 2.4rem; letter-spacing: -.02em; }
.tagline { color: var(--muted); font-size: 1.15rem; margin: 0 0 1rem; }
.install { color: var(--muted); font-size: .95rem; }
.install code { background: var(--tile); padding: .1rem .35rem; border-radius: 4px; }
.btn { display: inline-block; background: var(--accent); color: var(--accent-fg);
  text-decoration: none; padding: .55rem 1rem; border-radius: 8px; font-weight: 600; }
.btn.kofi { margin-top: 1rem; }
.grid { max-width: 1100px; margin: 1.5rem auto; padding: 0 1.25rem;
  display: grid; gap: 1.1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 12px;
  overflow: hidden; display: flex; flex-direction: column; }
.card .banner { width: 100%; aspect-ratio: 16 / 9; object-fit: cover;
  background: var(--tile); display: block; }
.card .body { padding: .9rem 1rem 1.1rem; display: flex; flex-direction: column; gap: .5rem; flex: 1; }
.card h3 { margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: .5rem; }
.card p { margin: 0; color: var(--muted); font-size: .95rem; flex: 1; }
.card .btn { align-self: flex-start; margin-top: .4rem; }
.badge { font-size: .68rem; text-transform: uppercase; letter-spacing: .04em;
  background: var(--tile); color: var(--muted); padding: .12rem .4rem; border-radius: 999px; }
.donate { max-width: 1100px; margin: 2rem auto 0; padding: 1.5rem 1.25rem;
  text-align: center; color: var(--muted); border-top: 1px solid var(--line); }
footer { max-width: 1100px; margin: 1rem auto 3rem; padding: 0 1.25rem;
  display: flex; gap: 1.25rem; justify-content: center; flex-wrap: wrap; color: var(--muted); }
footer a { text-decoration: none; }
footer a:hover, .donate a:hover { color: var(--accent); }
`;

export function renderCard(mod, gameSlug) {
  const badge = mod.isLibrary ? '<span class="badge">Library</span>' : '';
  const btn = mod.nexusModId
    ? `<a class="btn" href="${esc(nexusUrl(mod, gameSlug))}" target="_blank" rel="noopener">Get on Nexus</a>`
    : '';
  return `<article class="card">
  <img class="banner" src="assets/banners/${esc(mod.key)}.png" alt="${esc(mod.name)} banner" loading="lazy">
  <div class="body">
    <h3>${esc(mod.name)}${badge}</h3>
    <p>${esc(mod.summary)}</p>
    ${btn}
  </div>
</article>`;
}

export function renderPage({ mods, gameSlug, featuredKeys, meta }) {
  const ordered = orderMods(mods, featuredKeys);
  const count = mods.length;
  const cards = ordered.map((m) => renderCard(m, gameSlug)).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Jay's Desk — Infection Free Zone Mods</title>
<style>${CSS}</style>
</head>
<body>
<header class="hero">
  <h1>Jay's Desk</h1>
  <p class="tagline">${count} free mods for Infection Free Zone — performance, fixes, and gameplay expansions.</p>
  <p class="install">Drop the DLL into <code>BepInEx/plugins/</code>. <a href="${esc(meta.installDoc)}" target="_blank" rel="noopener">Full install guide</a>.</p>
  <a class="btn kofi" href="${esc(meta.kofi)}" target="_blank" rel="noopener">Support on Ko-fi</a>
</header>
<main class="grid">
${cards}
</main>
<section class="donate">
  <p>Enjoying the mods? <a href="${esc(meta.kofi)}" target="_blank" rel="noopener">Buy me a coffee</a>, or endorse them and enable Donation Points on Nexus.</p>
</section>
<footer>
  <a href="${esc(meta.nexusProfile)}" target="_blank" rel="noopener">Nexus</a>
  <a href="${esc(meta.github)}" target="_blank" rel="noopener">GitHub</a>
  <a href="${esc(meta.youtube)}" target="_blank" rel="noopener">YouTube</a>
  <a href="${esc(meta.discord)}" target="_blank" rel="noopener">Discord</a>
</footer>
</body>
</html>`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tools/site/`
Expected: PASS (7 tests total).

- [ ] **Step 5: Commit**

```bash
git add tools/site/render.mjs tools/site/render.test.mjs
git commit -m "feat(site): add card + page renderers with theme-aware inline CSS"
```

---

### Task 3: Orchestrator `build-site.mjs` + AGENTS.md + smoke run

**Files:**
- Create: `tools/site/build-site.mjs`
- Create: `tools/site/AGENTS.md`
- Generated (commit): `docs/index.html`, `docs/assets/banners/*.png`

**Interfaces:**
- Consumes: `renderPage` from Task 2; `tools/nexus-publish/mods.json`; `tools/nexus-publish/media/{key}.png`.
- Produces: `docs/index.html` + copied banners. No exports (CLI script).

- [ ] **Step 1: Write the orchestrator**

Create `tools/site/build-site.mjs`:

```js
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderPage } from './render.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const modsJson = join(here, '..', 'nexus-publish', 'mods.json');
const mediaDir = join(here, '..', 'nexus-publish', 'media');
const docsDir = join(repoRoot, 'docs');
const bannerOut = join(docsDir, 'assets', 'banners');

const FEATURED = ['PerfPack', 'IFZQualityOfLife', 'GreenhouseGrow', 'SquadGrenades', 'BlitzHund'];

const meta = {
  kofi: 'https://ko-fi.com/jaymade88',
  nexusProfile: 'https://www.nexusmods.com/profile/JaySNL',
  github: 'https://github.com/JaySNL',
  youtube: 'https://www.youtube.com/@jaysdesk',
  discord: 'https://discord.gg/habeKjNdN9',
  installDoc: 'https://github.com/JaySNL/IFZMods/blob/main/INSTALL.md',
};

const data = JSON.parse(readFileSync(modsJson, 'utf8'));
const gameSlug = data.game.slug;
const mods = data.mods;

mkdirSync(bannerOut, { recursive: true });
for (const m of mods) {
  const src = join(mediaDir, `${m.key}.png`);
  if (existsSync(src)) copyFileSync(src, join(bannerOut, `${m.key}.png`));
  else console.warn(`[warn] missing banner: ${m.key}.png`);
  if (!m.nexusModId) console.warn(`[warn] no nexusModId: ${m.key}`);
}

const html = renderPage({ mods, gameSlug, featuredKeys: FEATURED, meta });
writeFileSync(join(docsDir, 'index.html'), html);
console.log(`[ok] wrote docs/index.html (${mods.length} mods)`);
```

Note: a missing banner leaves the `<img>` pointing at a nonexistent file; the `.banner { background: var(--tile) }` rule renders a neutral tile instead of a broken-image box (the placeholder behavior from the spec). The warning tells you which banner to add.

- [ ] **Step 2: Run the generator**

Run: `node tools/site/build-site.mjs`
Expected: prints `[ok] wrote docs/index.html (34 mods)`; any `[warn] missing banner` lines name banners to add later (non-fatal).

- [ ] **Step 3: Verify outputs exist**

Run: `ls docs/index.html && ls docs/assets/banners/ | wc -l`
Expected: `docs/index.html` exists; banner count is > 0 (up to 34).

- [ ] **Step 4: Verify the page has no external asset requests and correct content**

Run:
```bash
grep -c 'assets/banners/' docs/index.html
grep -Eic '<link[^>]+stylesheet|<script[^>]+src=' docs/index.html
grep -c 'ko-fi.com/jaymade88' docs/index.html
```
Expected: first > 0 (cards present); second `0` (no external CSS/JS); third `1` at minimum (Ko-fi wired).

- [ ] **Step 5: Manual browser check**

Open `docs/index.html` in a browser (offline). Confirm: hero + count, mod cards with banners, "Get on Nexus" links resolve to the right mod ids, Ko-fi + footer links correct, no horizontal scroll, readable in both light and dark theme.

- [ ] **Step 6: Write `tools/site/AGENTS.md`**

Create `tools/site/AGENTS.md`:

```markdown
# AGENTS.md — tools/site (landing page generator)

Generates the static GitHub Pages landing page for the live IFZ mods.

## What this is
- `render.mjs` — pure functions (esc/nexusUrl/orderMods/renderCard/renderPage + CSS). No I/O. Unit-tested.
- `render.test.mjs` — `node:test`. Run: `node --test tools/site/`.
- `build-site.mjs` — reads `../nexus-publish/mods.json` + `../nexus-publish/media/{key}.png`,
  writes `docs/index.html` + `docs/assets/banners/`. Run from repo root: `node tools/site/build-site.mjs`.

## Rules
- Zero npm deps — `node:` builtins only. Output makes no external network requests (CSS inline, banners local).
- `mods.json` is canonical and read-only here. Protos are excluded automatically (not in mods.json).
- **Regenerate on every release** so the grid + live count stay in sync, then commit `docs/`.
- Featured order + fixed links live at the top of `build-site.mjs`.
- No real name anywhere. `git push` / Pages go-live is outward — only when the user asks.
```

- [ ] **Step 7: Commit**

```bash
git add tools/site/build-site.mjs tools/site/AGENTS.md docs/index.html docs/assets/banners
git commit -m "feat(site): generate landing page from mods.json"
```

---

## Post-plan: enabling GitHub Pages (user action, outward-facing)

Not a code task — do only when the user asks. In `JaySNL/IFZMods` repo settings → Pages → Source: `Deploy from a branch` → Branch `main` / folder `/docs`. Then `git push` so the committed `docs/` goes live at `https://jaysnl.github.io/IFZMods/`.

## Self-Review

- **Spec coverage:** hosting (`/docs` on main, post-plan section) ✓; data source (`mods.json`, Task 3) ✓; build script (Tasks 1-3) ✓; banner copy + missing-banner placeholder (Task 3 Step 1 + `.banner` background) ✓; ordering featured-first/alpha (Task 1 `orderMods`) ✓; hero/grid/donate/footer (Task 2 `renderPage`) ✓; library set-apart (Task 2 badge) ✓; theme-aware + no external fetch (Task 2 `CSS`, Task 3 Step 4) ✓; error handling warnings (Task 3) ✓; no-secrets/no-real-name/outward-ask (Global Constraints) ✓; YAGNI exclusions (no search/detail/webhook) ✓.
- **Placeholder scan:** none — all code and commands are literal.
- **Type consistency:** `esc`/`nexusUrl`/`orderMods`/`renderCard(mod, gameSlug)`/`renderPage({mods, gameSlug, featuredKeys, meta})` names + signatures match across Tasks 1-3 and tests.
