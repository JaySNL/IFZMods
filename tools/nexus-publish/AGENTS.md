# AGENTS.md — tools/nexus-publish (Nexus release pipeline)

> Read this BEFORE touching any release tooling. This is where the most time has been burned on
> wrong assumptions. Parent: [`../../AGENTS.md`](../../AGENTS.md).

## Cloudflare blocks node fetch — use the curl shim (DON'T re-debug this)
Cloudflare now binds `cf_clearance` to the client's **TLS/JA3 fingerprint**, not just IP+UA. So
`push-changelog.mjs` and `push-details-api.mjs` get a **403 "Just a moment" interstitial via node/undici
`fetch` even with a fresh, valid cookie**. System `curl` with the same cookie+UA passes (verified curl 200
vs fetch 403). The fix is in place: `curl-fetch.mjs` (a fetch-compatible shim backed by `spawnSync('curl')`),
imported as `import { curlFetch as fetch } from './curl-fetch.mjs'`. If a push 403s, the answer is NOT
"refresh the cookie again" — confirm the script imports the shim. (These 3 files sit in this gitignored dir
and aren't force-tracked, so the fix is local-only unless `git add -f`'d.)

## .env.local gotchas
- Values with spaces (the cookie has `; ` separators) **MUST be single-quoted** or the naive env loader
  truncates at the first space → only `nexusmods_session` sent → 403. Quote `NEXUS_COOKIE` + `NEXUS_UA`.
- `NEXUS_UA` must match the UA the cookie was captured under (cf_clearance is UA-bound too).
- Secrets here NEVER go to external/local LLMs.

## Versioning + upload
- Bump by **editing the existing `version` field** in the mod's `mods.json` entry — never insert a second
  one (JSON keeps the last dup → wrong version uploads silently).
- **Check the LIVE Nexus version first** and never downgrade the page. mods.json can lag what's actually live.
- `fileNotes` → the file Description, **255-char cap, ASCII only**.
- `requires: ["IFZModAPI"]` drives the Requirements tab; source of truth = `BepInDependency` in dev source.

## Uploads are auto-ZIPPED — a bare .dll gets quarantined
`nexus-upload.mjs` no longer PUTs the raw `.dll`. A bare DLL upload is **auto-quarantined** by Nexus
(scanner "fails to preview archive contents" for a raw PE and holds the file even at **0/70 VirusTotal**
— confirmed on QoL 1.6.2, sha `acdd2b92…`). `packForUpload()` now wraps the DLL into
`BepInEx/plugins/<dll>.zip` (mod-manager-friendly path) right before upload, via `zip` then p7zip
fallback (needs `zip` or `7z`/`7za` on PATH). `dllPath` in mods.json stays the `.dll` (preflight still
validates the version against the RAW dll); a non-.dll `dllPath` is uploaded as-is (pre-archived). If a
file still lands quarantined despite the zip, appeal at support@nexusmods.com with a 0/70 VirusTotal link
— they release clean files. DON'T delete the quarantined file (breaks version history); archive it +
set the new zip as main in the browser.

## `nexus-upload.mjs` needs an ACTION VERB — there is no bare/safe-to-poke mode
Every path in `nexus-upload.mjs` that isn't `list` performs a **REAL upload** the instant it runs. It used
to treat `argv[2]` as a mod key whenever it wasn't a verb, so `nexus-upload.mjs list Foo` uploaded Foo and
a **bare** `nexus-upload.mjs` uploaded **every** mod — this dropped **6 accidental duplicate files across
live mod pages** (2026-07-09, GreenhouseGrow 72 + 5 unrelated). Fixed: an unrecognized/missing verb now
REFUSES and exits without touching Nexus. Valid verbs: `list` (READ-ONLY files.json dump, safe), `add
auto|<ver>`, `update auto|<ver>`. To inspect file IDs before acting, ALWAYS `node nexus-upload.mjs list
[Key…]` — never a bare or exploratory call. Prefer `publish-all.mjs --send <Key>` (dry-run unless `--send`)
for real releases; call `nexus-upload.mjs` directly only when you specifically need the raw file step.

## NEVER re-run `publish-all --send` to look at its output
Piping it through `head`/`sed`/`tail` truncates your VIEW, not the run — a second `--send` performs a
second REAL upload. Doing this on ThaiLanguage 0.1.1 created two identical v0.1.1 MAIN files (320 +
321) minutes apart. Capture the output the first time (`| tee`) or read the whole thing; if you already
double-uploaded, `node archive-old-files.mjs --send <Key>` keeps the newest and archives the rest.
The changelog survives it — `push-changelog.mjs` skips a version that already has an entry unless
`--force` — so a double-run costs you a duplicate FILE, not a duplicate changelog entry.

## Run the ONE pipeline, not piecemeal
`node publish-all.mjs --send <Key>` does upload + requirements + details in order. Running steps by hand
drops the Requirements tab (happened: RaiderEscalation shipped without the API dep). For the post-upload
page bits alone, `push-changelog.mjs --send <Key>` + `push-details-api.mjs <Key> --send`.

## Changelog entries are APPEND-ONLY — get the text right the first time
`changelogs/add` is the only changelog route we have; there is **no edit and no delete**. The server stores
**each newline of `changelogText` as a separate entry id** under the version key (mod 54's `"1"` key holds 11
ids from a single old push). So `push-changelog.mjs --send --force` on a version that already has an entry
**appends a second one** — it does not replace. To correct live text: delete the entry in the browser
Changelogs editor first, THEN re-run the push. Inspect current entries (and cheaply probe whether the cookie is
still alive) with the cookie-authed read the script itself uses:
`GET next.nexusmods.com/api/flamework/mods/documentation?gameId=7442&modId=<n>` → `{changelog:{"<ver>":[{id,…}]}}`.
200 = cookie good; 403 "Just a moment" = `cf_clearance` expired, refresh it.

Corollary: `push-requirements.mjs` anchors to the dep's NEWEST active file, so a `fileNotes` line claiming
"Requires IFZ Mod API 1.2.1+" ends up next to a Requirements tab saying "≥ 1.9.1". Write `fileNotes` against
the CURRENT API version, not the historical minimum (bit Flares 0.2.1).

## Bumping a dependency's min version → `push-requirements.mjs --rebump`
`push-requirements.mjs` is idempotent-by-mod: if a required mod is ALREADY listed on a file's
Requirements tab it prints `= already required` and skips, so it will NOT move a stale
`min_version_id` (e.g. a dep anchored to API 1.6.2 stays there after you ship API 1.7.0). Deps live
on a FILE VERSION and the PUT replaces the whole set, so use `--rebump` to re-anchor: it drops the
existing set and re-sends fresh anchors for EVERY entry in the mod's `requires` (each pinned to that
target's newest active file). Run it AFTER uploading the new target version. Example — after pushing
API 1.7.0, bump its dependents: `node push-requirements.mjs --send --rebump ExtendedHealth ElderPop`
(re-anchors API ≥1.7.0 and keeps ElderPop's Panels dep, both [204]).

## Dependency on an UNPUBLISHED mod → 422 (publish target FIRST)
`push-requirements.mjs` gets `422 "target mod is not published"` when a mod requires another mod whose
Nexus page is still a **draft**. A brand-new page (uploaded via the API) starts as a draft you must
publish in the browser. So the order for a release where mod A requires new mod B is: upload B →
**publish B's draft in the browser** → then (re-)run `push-requirements.mjs --send A` so A's dep on B
sticks. The file upload + changelog + details for A all succeed regardless; only the Requirements row
is blocked. (Seen: IFZQualityOfLife 1.6.0 requiring the new IFZModPanels page 77.)

## `list` 403s on an UNPUBLISHED page — that is NOT proof the page is missing
`nexus-upload.mjs list` reads the v1 `files.json`, which returns `403 {"code":403,"message":"Mod not
available: <id>"}` for any page that is still an unpublished draft — **before and after** you upload a
file to it. Do not read that 403 as "the page does not exist" and do not conclude it from comparing
against another mod that lists fine (a page that lists fine is simply already published). Confirmed on
mod 93 (Thai Language): 403 before upload, `publish-all --send` then succeeded on all four steps, and it
still 403s afterwards because the page is a draft. To check whether a page exists, open its URL — the
API cannot tell you. Corollary: a brand-new page must be **published in the browser** once its file,
changelog and details are in; the API can fill a page but cannot publish it.

## Media (banner/gallery) upload needs a FRESH cookie; file upload does not
File upload / requirements / changelog / details use `NEXUS_API_KEY` (stable). Gallery **media** upload
(`upload-media-api.mjs` / `upload-media.mjs`) uses `NEXUS_COOKIE`+`NEXUS_UA` through Cloudflare and 403s
the moment `cf_clearance` goes stale. If a release's files land but the banner 403s, refresh the cookie —
the generated banner PNG under `media/<Key>.png` is reusable, only the upload step needs re-running. Nexus
main/thumbnail image is still a manual browser step the API can't set.

## After a meaningful change here
Update this file. Record new CF/auth quirks here first (this is the canonical place), then mirror the
durable fact to memory `nexus-release-tooling`.
