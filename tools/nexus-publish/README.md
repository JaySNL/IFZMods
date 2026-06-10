# nexus-publish

Playwright pipeline for bulk-creating and updating the IFZMods Nexus pages.

**Why this exists.** Nexus's official Upload API only updates *existing* mod pages. Creating a new page still requires the web form. This harness drives the web form for you.

**What this is not.** Not officially blessed automation. Nexus may rate-limit, captcha, or break the selectors at any time. Run semi-auto (default) — you watch each form, click Submit yourself, the script captures the resulting mod ID and moves on. Faster than fully manual, safer than fully auto.

---

## One-time setup

```sh
cd tools/nexus-publish
npm install
npm run login       # opens system Chrome; sign into Nexus; close window when done
```

Uses your system Chrome (`channel: "chrome"` in `publish.mjs`) — no Playwright Chromium download. The profile is saved to `./profile/`. Future runs reuse it — you stay signed in.

**Cloudflare note.** Nexus is fronted by Cloudflare bot detection. Headed runs with the persistent profile pass through fine after the one-time login. Headless will not (expected) — leave the script in headed mode.

---

## Creating all 18 pages (semi-auto)

```sh
npm run create
```

For each mod listed in `mods.json` without a `nexusModId`:
1. Opens `https://www.nexusmods.com/infectionfreezone/mods/add` in the persistent browser.
2. Auto-fills name, summary, description, version, category, file upload.
3. Stops and lets *you* click Submit (gives you a chance to fix anything the script missed — tags, requirements, permissions checkboxes, screenshots).
4. Waits up to 5 minutes for the redirect to `/mods/<id>`.
5. Parses the mod ID from the URL, writes it back to `mods.json`, moves on.
6. Waits 20s before the next mod (anti-spam).

If the script can't find a form field (Nexus updated the DOM), it logs `✗ <field>` and continues. Fill any missing fields manually, then click Submit.

To run fully auto (script also clicks Submit):
```sh
npm run create -- --auto
```

To dry-run on the first mod and inspect the form without submitting:
```sh
npm run dry-run
```

---

## Updating existing pages (after `nexusModId`s are set)

```sh
npm run update
```

Opens each mod's file-edit tab, attaches the new DLL, waits for you to fill version + changelog and click Submit. Throttled to 15s between mods.

---

## Files

- `mods.json` — single source of truth. One entry per mod with `name`, `summary`, `description`, `category`, `tags`, `dllPath`, plus `nexusModId` (populated by `--create`).
- `publish.mjs` — the runner.
- `profile/` — persistent Chromium profile (gitignored). Holds your Nexus session cookies.
- `package.json` — pins Playwright.

---

## Troubleshooting

- **"not logged in"** → run `npm run login`.
- **Captcha appears** → solve it in the browser. The script is headed; you have control.
- **Selectors stop matching after Nexus UI change** → run `npm run dry-run` to inspect, update selectors in `publish.mjs` → `fillNewModForm`. The function tries a list of candidates per field; add yours to the head of the list.
- **Rate-limit** → bump the `await sleep(20_000)` between mods to 60s+. Nexus has anti-spam on new-mod creation; the limit is undocumented.
- **Mod ID not parsed** → script timed out waiting for `/mods/<id>` redirect. Open the new mod page manually, copy the ID, paste into `mods.json`, re-run — `--create` skips mods that already have an ID.

---

## After all pages exist

Switch to the **official Nexus Upload API** for future releases. The GitHub Action `Nexus-Mods/upload-action` reads a matrix of mod IDs from `mods.json`, builds each DLL, and pushes the new version to its existing page on every tag. That's the long-term automation; this Playwright harness is just for the one-time page creation.
