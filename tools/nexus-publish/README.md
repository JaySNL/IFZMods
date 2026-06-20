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

## Updating existing pages — the API uploader (canonical)

```sh
# new file on each page at its mods.json version (NEXUS_API_KEY from .env.local)
node nexus-upload.mjs add auto IFZModAPI Flares PerfPack   # specific keys
node nexus-upload.mjs add auto                              # all mods with a nexusModId
```

`add` posts a new **MAIN** file to an existing page via the official Upload API — no browser. Each
file's **Description** ("what's new/fixed", shown on the Files tab, **255-char cap**) comes from that
mod's `fileNotes` in `mods.json` (falls back to `summary`). Confirmed: this sets the live description
automatically, so no manual step for new versions.

**Releasing a new version — do this:**
1. **Edit** the mod's existing `version` field in `mods.json` (do NOT add a second `version` key — JSON
   keeps the *last* duplicate, which silently uploads the wrong version). Update its `fileNotes`.
2. Check what's already live so you don't upload a duplicate file:
   `curl -s -H "apikey: $KEY" https://api.nexusmods.com/v1/games/infectionfreezone/mods/<id>/files.json`
3. `node nexus-upload.mjs add auto <Key>` — a **preflight guard** aborts if any entry has duplicate
   `version` keys or if the version string isn't found in the DLL bytes (stale build / typo).

**What the public API CANNOT do (use the website):** delete a file, or edit an existing file's
description in place (`add` would duplicate; `update` archives the current file). Fix mislabeled/old
files manually on nexusmods.com.

`npm run update` (Playwright) still exists for the rare case the API path can't be used, but the API
uploader above is the route.

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
