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
