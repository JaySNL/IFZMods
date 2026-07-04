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
