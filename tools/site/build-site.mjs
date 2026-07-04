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
