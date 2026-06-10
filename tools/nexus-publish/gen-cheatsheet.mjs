// Regenerate CHEATSHEET.md from mods.json — copy-paste blocks per mod for the Nexus web form.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, 'mods.json'), 'utf8'))

let out = `# IFZMods Nexus copy-paste cheat sheet

One section per mod. Page exists already? Open it and paste into the matching fields.
Creating fresh? My Mods → **Add a file** → paste modal fields → Create draft → paste edit-page fields.

Game = Infection Free Zone, Category = Miscellaneous (only option IFZ exposes).

| key | Nexus id | requires |
|---|---|---|
${CFG.mods.map((m) => `| ${m.key} | ${m.nexusModId ?? '—'} | ${m.requires ? m.requires.join(', ') : ''} |`).join('\n')}

---

`

for (const m of CFG.mods) {
  const dll = path.resolve(HERE, m.dllPath).replace(/\//g, '\\')
  out += `## ${m.key} → ${m.name}${m.nexusModId ? `  (mod ${m.nexusModId})` : ''}\n\n`
  if (m.requires) out += `> **Requirements tab:** add **${m.requires.join(', ')}**.\n\n`
  out += `**Mod Name**\n\`\`\`\n${m.name}\n\`\`\`\n\n`
  out += `**Short description**\n\`\`\`\n${m.summary}\n\`\`\`\n\n`
  out += `**Tags:** ${m.tags.map((t) => `\`${t}\``).join(', ')}\n\n`
  out += `**Version:** \`${CFG.common.version}\`  ·  **File:** \`${dll}\`\n\n`
  if (m.sections) {
    out += `<details><summary>Full description (5 sections)</summary>\n\n`
    out += `**Description**\n\`\`\`\n${m.sections.description}\n\`\`\`\n\n`
    out += `**Installation instructions**\n\`\`\`\n${m.sections.installation}\n\`\`\`\n\n`
    out += `**Main features**\n\`\`\`\n${m.sections.mainFeatures}\n\`\`\`\n\n`
    out += `**Requirements**\n\`\`\`\n${m.sections.requirements}\n\`\`\`\n\n`
    out += `**Shout outs**\n\`\`\`\n${m.sections.shoutOuts}\n\`\`\`\n\n`
    out += `</details>\n\n`
  }
  out += `---\n\n`
}

fs.writeFileSync(path.join(HERE, 'CHEATSHEET.md'), out)
console.log(`Wrote CHEATSHEET.md — ${CFG.mods.length} mods.`)
