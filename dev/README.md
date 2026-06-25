# dev/ — proto / unreleased builds

Staging area for **work-in-progress mod DLLs** not yet released to Nexus.

- **Not shipped to users.** `install.{sh,ps1,bat}` and `manual-install/` only copy from
  `plugins/`. Files here are never installed by the public scripts.
- **For testing / handing to testers.** Drop a proto DLL here, hand it to a tester to copy into
  their `BepInEx/plugins/` manually.
- BepInEx 5 *does* load plugins recursively from `BepInEx/plugins/` subfolders at runtime — so if
  a tester nests a DLL under the game's plugins dir it still loads. This `dev/` folder is repo
  staging only; it is **not** the game's plugins dir.
- When a proto graduates: move its DLL into `plugins/`, update `CHANGELOG.md` / `mods.json`, then
  publish via `tools/nexus-publish/`.

## Current contents

_(empty — NoPath - YesPath v0.2.0 graduated to `plugins/` after in-game verify 2026-06-26.)_
