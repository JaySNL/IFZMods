# IFZMods-dist — distribution repo

This is the **distribution / release** repo for the IFZ mods: built DLLs in `plugins/`, install
scripts (`install.{sh,ps1,bat}`, `manual-install/`), `tools/nexus-publish/` (Nexus Mods upload), and
the public `CHANGELOG.md` / `README.md` / `INSTALL.md`.

## Code work is NOT here

Mod **source**, the decompiled game, and `build.sh` live in the sibling **dev** repo
`/home/jooshua/Projects/IFZ-Modding/` (see its `CLAUDE.md` for build/deploy, the verified perf-facts,
the patch registry, and working rules). Edit source there, not the built DLLs here.

## What happens here

- Stage built DLLs into `plugins/` (source→dist copy is currently manual — confirm the flow before
  relying on it).
- Publish to Nexus via `tools/nexus-publish/` — outward-facing; confirm with the user before uploading.
- Update `CHANGELOG.md` on release.

Commit/push/publish only when the user asks.
