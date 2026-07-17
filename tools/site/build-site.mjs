import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderPage, renderApiPage } from './render.mjs';

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

const apiDir = join(here, 'api');
const API_ORDER = ['IFZModAPI', 'IFZModPanels', 'IFZModDialog', 'IFZResourceApi'];
let apis = [];
if (existsSync(apiDir)) {
  const byKey = new Map();
  for (const f of readdirSync(apiDir)) {
    if (!f.endsWith('.json')) continue;
    const a = JSON.parse(readFileSync(join(apiDir, f), 'utf8'));
    byKey.set(a.key, a);
  }
  const known = API_ORDER.filter((k) => byKey.has(k)).map((k) => byKey.get(k));
  const extra = [...byKey.keys()].filter((k) => !API_ORDER.includes(k)).sort().map((k) => byKey.get(k));
  apis = [...known, ...extra];
}
const apiHtml = renderApiPage({ apis, meta });
writeFileSync(join(docsDir, 'api.html'), apiHtml);
console.log(`[ok] wrote docs/api.html (${apis.length} APIs)`);
