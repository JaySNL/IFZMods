# Nexus Mods API — living reference

> Working notes on the Nexus Mods API surface as used by this repo's tooling. **Append here whenever
> you learn something new** (endpoint, field, quirk) so we stop re-deriving it. Last verified 2026-07-07.

Game domain: `infectionfreezone`. Our mod numeric IDs: see `mods.json` `nexusModId` (e.g. PerfPack 35,
QoL 33, SmartWorkerRedist 37).

## Auth & hosts

| Host | Auth | Used for |
|------|------|----------|
| `api.nexusmods.com/v1` | header `apikey: <NEXUS_API_KEY>` | READ: list files, mod info |
| `api.nexusmods.com/v3` | header `apikey: <NEXUS_API_KEY>` | file UPLOAD, read mod/files/versions, update file-group name |
| `api.nexusmods.com/v2/graphql` | `apikey` **or** cookie | GraphQL (endorse/track/collections/comments — **no file-management mutations**) |
| `www.nexusmods.com` | cookie + **curl-impersonate** (CF JA3-gated) | media/banner upload; anything the *site* does that the API doesn't |

Creds live in `.env.local` (gitignored): `NEXUS_API_KEY`, `NEXUS_COOKIE`, `NEXUS_UA`.
`www` is Cloudflare-JA3-gated — plain `node fetch`/`curl` 403s; use `/usr/bin/curl-impersonate
--impersonate firefox147 --compressed` with `-H "User-Agent: $NEXUS_UA" -H "Cookie: $NEXUS_COOKIE"`
(run under bash, not fish). See memory `nexus-media-cf-bypass`.

## THE .7z RULE (quarantine)  ← most important operational fact

Nexus auto-**quarantines** an uploaded file if its scanner can't preview the archive:
- a **bare `.dll`** → quarantined ("fails to preview archive contents" for a raw PE).
- a **single-DLL `.zip`** → **also quarantined** (observed on PerfPack 1.5.4, 2026-07-07).
- a real **`.7z`** container → previews clean, passes.

`nexus-upload.mjs` → `makeArchive()` now emits **`.7z`** (`7z a -t7z`), wrapping the DLL as
`BepInEx/plugins/<dll>` (Vortex/MO2-friendly). Never upload `.dll` or `.zip`. A quarantined file
must be replaced by re-uploading (`publish-all --send <Key>` re-packs as `.7z` and adds a new file),
then the old one archived (see below).

## Upload flow (v3, in nexus-upload.mjs)

1. `GET  /v3/games/{game}/mods/{numericId}` → `{data:{id}}` = opaque **mod UID** (e.g. 37 → 31963146616869).
2. `POST /v3/uploads {size_bytes, filename}` → `{id, presigned_url}`.
3. `PUT  <presigned_url>` (raw archive bytes; headers `Content-Disposition: attachment; filename=...`,
   content-type; **no apikey** — URL is pre-signed).
4. `POST /v3/uploads/{id}/finalise`.
5. poll `GET /v3/uploads/{id}` until `state=available`.
6. `POST /v3/mod-files {upload_id, mod_id, name, version, file_category:"main"}` → creates the file.

`publish-all.mjs --send <Key>` runs upload → requirements → changelog → details (idempotent; re-running
is safe, changelog/details return 200/skip). `add auto` derives version from `mods.json`.

## Read endpoints (verified)

- **v1 file list** (best for category + file_id):
  `GET /v1/games/{game}/mods/{id}/files.json` → `files[]{file_id, category_name, version, file_name, uploaded_time}`.
  `category_name` ∈ MAIN, UPDATE, OPTIONAL, OLD_VERSION, MISCELLANEOUS, ARCHIVED, REMOVED.
- **v3 mod**: `GET /v3/games/{game}/mods/{id}` → `{data:{id(uid), game_scoped_id, game_id, name}}`.
- **v3 file groups**: `GET /v3/mods/{uid}/files` → `{data:{mod_files:[{id, name, is_active,
  last_file_uploaded_at, versions_count, archived_count, removed_count}]}}`. A "mod_file" is a
  **version group**; `is_active:false` ⇒ all its versions archived/removed.
- **v3 versions of a group**: `GET /v3/mod-files/{groupId}/versions` →
  `versions[]{id, game_scoped_id, name, version, category("main"|...), is_primary, uploaded_at}`.
  **`game_scoped_id` == the v1 `file_id`.**
- **v3 single version**: `GET /v3/mod-file-versions/{versionId}` (read-only).

## Write endpoints

- **Update file-group name**: `PUT /v3/mod-files/{groupId}` body `UpdateModFileRequest` — **requires
  `name`**; returns 204. Extra keys (category/is_active/file_category/category_id) are **silently
  ignored** — this does NOT change category or archive.
- **GraphQL mutations** (`/v2/graphql`, 73 total, apikey or cookie): endorse, track, collections,
  comments, tags, api-keys, moderation… **none touch mod files/versions/categories.**

## ARCHIVE a file / set category  (SOLVED 2026-07-07 — cookie-gated site route)

**NOT in the apikey API.** It's a Next.js site route, Cloudflare-JA3-gated → curl-impersonate + cookie:

```
POST https://next.nexusmods.com/api/flamework/mods/archive-file
Cookie: <NEXUS_COOKIE>   (curl-impersonate --impersonate firefox147 --compressed)
Content-Type: application/json
Origin: https://www.nexusmods.com   Referer: https://www.nexusmods.com/
body: {"fileId": <v1 file_id>, "gameId": 7442, "modId": <numeric mod id>}
```
`gameId` **7442** = infectionfreezone (required; a missing/other numeric field is what makes the app
reject with `{"error":"Expected number, received nan"}`). `fileId` = the **v1 `file_id`**
(== v3 `version.game_scoped_id`), NOT the v3 group/version id. Success → `{"success":true}` (200).

Helper: **`node archive-old-files.mjs [--send] <Key ...>`** — lists each mod's MAIN files, keeps the
newest by `uploaded_time`, archives the rest (policy: always keep only the latest online). Dry-run
without `--send`. Backs off on v1 429/403, throttles the site endpoint (~600ms). Cross-ref
`nexus-media-cf-bypass` for the curl-impersonate pattern.

Ruled out (don't retry these): `PUT /v3/mod-files/{id}` (category silently ignored, 204 no-op);
`/v3/mod-file-versions/{vid}` (read-only, PATCH/PUT/DELETE 404); v2 GraphQL (73 mutations, none for
files, apikey or cookie); legacy `www/Core/.../SetFileCategory` (dead); `www.nexusmods.com/api/...` (not a route).

Note: v1 `files.json` returns **403 "Mod not available"** for hidden/moderated mod pages (mod.json still
200); use v3 `GET /v3/mods/{uid}/files` (`is_active`) to inspect those instead.

## Gotchas
- API **cannot delete** files (by design). Archive is the intended way to retire old versions — but see OPEN above.
- Duplicate-version files are allowed (Nexus keeps file history); re-uploading `1.5.4` as `.7z`
  just adds a new file alongside the old — then archive the old.
- Policy: **keep only the newest file (the `.7z`) as MAIN per mod; archive the rest**, unless asked to
  keep a specific version set.
