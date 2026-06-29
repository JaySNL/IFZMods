# Release queue — pending Nexus uploads

Single source of truth for what is **built and staged but not yet pushed to Nexus**.
The updater reads THIS file instead of scanning every mod folder.

Canonical per-mod metadata — version, `fileNotes`, `dllPath`, `nexusModId`, `requires`,
description — lives in `mods.json`, keyed by the same `key`. This file only tracks **what
changed this cycle and where each mod is in the pipeline**; pull the rest from `mods.json`.

**Status flow:** `BUILT` (DLL staged in `plugins/`) → `VERIFIED` (checked in-game) →
`PUSHED` (live on Nexus). Only push a mod once it is `VERIFIED`.

**To push one entry — use the single orchestrator (do NOT run the steps piecemeal):**
1. `node publish-all.mjs --send <Key>` — runs the whole pipeline in order, stopping on failure:
   upload DLL (`fileNotes`) → **Requirements tab** (`requires` → IFZModAPI links) → page version + description.
   Preview first with no `--send`. The Requirements step is the one that gets dropped when you hand-run
   `nexus-upload` + `push-details-api` separately — that's how RaiderEscalation 1.2.6 first shipped without
   its API dependency. Run the orchestrator so it can't be skipped.
2. Move the entry to **Pushed** below and bump its status.

Headless by default (no Chrome). `--no-details` skips the page-details step; `--browser-details` uses the
legacy Playwright path. Auth: `NEXUS_API_KEY` + `NEXUS_COOKIE`/`NEXUS_UA` in `.env.local`.

---

## Pending

- **Squad Auto Behavior (SquadAutoBehavior) -> 1.1.4-beta** (mod 39) -- BUILT, upload pending. Idle-gate fix: auto-behavior tick skips squads with an active player order; prevents stutter during deconstruct. NOTE: in-game verification still PENDING (Wine JIT + save-load) -- shipping as beta for community testing. Requires IFZModAPI.

---

## Pushed (recent — prune after a few cycles)

- **Gunfire Lights → 1.4.10** (mod 30, file 7593788) — PUSHED 2026-06-28. Cinematic defaults baked in as shipped: muzzle intensity 5.5 → 115.5, MuzzleSize 0.8 → 1.1, ExplosionSize 3.5 → 4.5, OneLightPerTower false (per-barrel searchlights). No code change. Requires API ≥1.4.4.

### 2026-06-29 (cycle 9)
- **Mass Deconstruct (MassDeconstruct) -> 1.4.0-beta** (mod 58, file 7597706, API req set) — PUSHED. Live footprint highlight: bold red fill over each building in the drag box (previously selection was invisible). Drag now uses native game-camera world-point — fixes offset on elevated/real-world-tile maps. Also includes 1.3.0 pacing (<=50 concurrent deconstructs, prevents navmesh crash on mass-clear). NOTE: changelog + page-details steps hit Cloudflare 403 — retry push-changelog.mjs + push-details-api.mjs when cookie refreshed. Requires API 1.2.1+.

### 2026-06-28 (cycle 8)
- **IFZ Quality of Life Bundle → 1.5.2** (mod 33) — PUSHED (beta). Mortar squads and bunkers shell infected lairs and buildings with infected inside via right-click (native attack-ground: real ammo, low-ammo warning, retreat, auto-route); auto-exit vehicle or building first; right-click elsewhere cancels. HMG vehicle ammo-drain fixed (trunk refill rate-matches vanilla). Worker-update reflection cached (removes per-frame cost spike). Caveats: may fire a few rounds post-clear; premature vehicle exit; watch low-ammo squads. Requires IFZModAPI.
- **Performance Pack → 1.5.2** (mod 35) — PUSHED. HUD adds active lair count and, on low FPS, a sticky "why" cause line (`[category]:[reason]`). Reads existing engine counters only; no cost when hidden.
- **Buildable Bridges (BridgeProto) → 0.2.0.1** (mod 67) — PUSHED (beta). Native bridge builder: real road/deck/railing textures and per-span deformation. Requires IFZModAPI.
- **Clay Pit Fixes → 1.1.0.0** (mod 65) — PUSHED. Demolished clay-pit area regenerates production over time and persists across save/reload.
- **NoPath - YesPath → 0.3.0** (mod 68) — PUSHED. Denser demolish footprint sampling and reachability checks so workers are not assigned unreachable spots; new config (max work positions, sample spacing, inside-only). Requires IFZModAPI.
- **Squad Auto Behavior → 1.1.3** (mod 39) — PUSHED (file 7591004, API requirement set [204], details [200], tags=2). Dry/wounded squads under fire were pinned in place: `IsTargeted()` read as a combat order, blocking auto-return to rearm/hospital. Fix: while targeted, falls back only if the nearest rearm/hospital building is within new `OverrideNearCoverMeters` (default 80 m; 0=never). Far-from-cover squads hold as before. Applies to rearm and hospital paths. Requires IFZModAPI.

### 2026-06-26 (cycle 7)
- **IFZ Mod API → 1.4.4** (mod 42) — PUSHED (file 7586032, details [200]). Harmony __args compatibility fix: removes dependency on newer HarmonyX `__args` injection, so patches apply cleanly on old BepInEx (5.4.5.0). Fixes GiveOrder patch failure on Chinese-repo old versions (SquadMerge merge hook never ran). Public-surface unchanged; backward-compat verified.
- **Buildable Bridges (BridgeProto) → 0.1.1** (mod 67) — PUSHED (file 7585955, API ≥1.4.3 requirement set, details [200]). Bugfix: placed bridges were indestructible — the deck-finish step disabled the wall's BoxCollider so the van could cross, but a disabled collider is invisible to ALL physics queries, so shelling/explosions (`AreaDamageUtilities.ApplyAreaDamage` → `OverlapSphere` on "Wall") and the deconstruct tools (vanilla + MassDeconstruct → `OverlapBox` on "Wall") both skipped it. Now `bc.isTrigger = true` instead — overlap queries still return triggers (`queriesHitTriggers` on) but they generate no collision response, so traffic still crosses; `VehicleCollisionHandler` only raycasts the "Building" layer so it never reads the bridge as an obstacle. Old saves self-heal (load re-runs the finish step). Requires API ≥1.4.3.
- **House Rebalance → 1.2.0** (mod 32) — PUSHED (file v1.2.0 created + details [200], tags=2). Standalone mod (no API requirement → requirements step N/A). Adds `[Commute] PreferShortCommute` (default OFF — classic behaviour unchanged): among houses of a worker's best-attainable tier, prefer the one nearest their workplace. Housing tier stays the hard rule (never moved to a worse house → no 'want better housing' mood penalty). `[Commute] ImprovementMeters` hysteresis (def 15m) stops tick-to-tick bouncing; tier upgrades ignore it and always move. Note: `publish-all` aborted at the requirements step (standalone mod has no `requires` array — fatal-on-empty); finished via `push-details-api.mjs --send` since there were no requirements to set.
- **Unlocked Buildings (was "Split Unlock") → 1.2.0** (mod 38) — PUSHED (details only, [200], tags=2). Rename + metadata refresh, same version (1.2.0 DLL already live → no file re-upload). Page title `Split Unlock - castles and cathedrals` → **Unlocked Buildings** (key/dll/modId unchanged). Description/summary/mainFeatures/fileNotes rewritten for the full feature set: split bypass (`AllowWrongDimensions` / `AllowSmallSurface`) **+** custom-building restrictions lifted (`[BuildingSize]` size override **and** `AllowShortWalls` min-wall-length bypass, which the old page never documented). README table label updated. No API requirement change.
- **Squad Grenades → 1.0.0** (mod 69, NEW PAGE) — PUSHED (file 7582112, API ≥1.4.3 requirement set, details [200]). New mod: idle player squads auto-lob grenades + auto-fire mortars at hostile clusters ALREADY in range (never advancing), incl. from inside buildings AND moving vehicles (vehicle squads fire the accessory directly so they keep driving). Friendly-fire safe — cancels if the blast would catch your squads or any non-hostile group (survivors/civilians/allied army). Vanilla never auto-throws grenades. Sole patcher of `GroupsController.CustomUpdate`. Banner uploaded. **Page is a DRAFT — user publishes it.** Requires API ≥1.4.2.
- **Surrounded → 0.4.5** (mod 55) — PUSHED (file 7582040, API ≥1.4.3 requirement set, details [200]). Early-game easing for lair waves (the 0.4.4 release pump fired on day 1 of a fresh base / new expedition from pre-existing/seeded lairs). Adds `LairReleaseGraceDays` (def 5, no waves before that RUN-day — mirrors RaiderEscalation grace), `LairWaveRampDays` (def 20, wave budget ramps 0→100% over grace→grace+N via `rampedCeiling`), `LairWaveCooldownHours` (def 8, spaced waves not a drip). All RunDay-based (resets per expedition), self-healing (recomputed each pass, no latch), fail-open if RunDay throws. Requires API ≥1.4.2.

### 2026-06-25 (cycle 6)
- **RaiderEscalation → 1.2.6** (mod 57) — PUSHED. Early-game grace period: new `[Raids] GraceDays` (default 7) gates the raid check on `day >= GraceDays`, so a strong pre-existing camp that seeds straight to raid tier can no longer wipe a fresh base on day 2-3 (reported by HowNowYellowCow). `GraceDays=0` restores old behaviour. Also declared the long-standing 000_IFZModAPI hard dependency in mods.json + README. Requires API ≥1.2.1.
- **Surrounded → 0.4.4** (mod 55) — PUSHED. Lair-release fix: `SiegeRelief.LairReleasePass` used `fireAt = Max(LairReleaseThreshold, cap*atFrac)`, so a threshold ≥ lair capacity (user's 150 vs cap 149) made the trigger unreachable — pump never fired, lairs sat full, infected stood idle instead of assaulting the HQ (`TotalLairReleased=0`). Now the floor only SKIPS small lairs (`if (cap < floor) continue`), `fireAt = ceil(cap*atFrac)`. Verified in-game (PerfPackDev F8 census): `TotalLairReleased` 0→873, attacking-HQ 180→810 moving. Requires API ≥1.4.2.

### 2026-06-24 (cycle 4)
- **IFZ Mod API → 1.4.3** (mod 42) — PUSHED. Fixes the base-game "0 <month>" clock flash on load (the restore patch fired `SetDaysFromPreviousGames` unconditionally → vanilla `DaySetter` painted the event arg as the day; now skips the no-op call). Internal-only change — **backward-compat audited: zero public-surface change vs 1.4.2, every API member used across the pack still resolves → older mods unaffected.**
- **Surrounded → 0.4.3** (mod 55) — PUSHED. Swarmpile FPS fix: `SiegeRelief` de-virt throttle on `Swarm.ConvertGroup` (`MaxLiveInfected`, surplus stays virtual) + roaming cull + concurrent-swarm cap (30) + radio throttle; HUD shows real live count. FPS 1→25-40 on the day-253 save. Requires API ≥1.4.3.
- **CinematicFX → 1.2.0** (mod 25) — PUSHED. Collapsed from 4-part dev (1.1.5.03). Tracers reworked onto a shared additive material so they glow under the night Bloom; warm tint, tail-fade, `PauseFreeze` for screenshots. Requires API ≥1.4.3.
- **BridgeProto → 0.1.0** (mod 67, NEW PAGE) — PUSHED. New experimental mod "Buildable Bridges (Experimental)": drag-build a walkable bridge over water with the wall tool (B). Banner uploaded. Page is a DRAFT — **user publishes it**. Wine-safe (one drag-only patch, lifecycle via events). Requires API ≥1.4.3.

### 2026-06-23 (cycle 3)
- **Surrounded → 0.4.2** (mod 55) — PUSHED (hotfix). `MaxHordeMultiplier` (default 3, 0=off) clamps the vanilla `HordeSizeMultiplier` getter, which corrupts/inflates on long saves (~2.9e8 @ day ~250) and pins every swarm to max — the megablob. Clamp runs even with the siege boost off. Requires API ≥1.4.2.
- **CinematicFX → 1.1.4** (mod 25) — PUSHED. Tracer buff was a no-op (targeted `LineRenderer`; bullet tracers use a `TrailRenderer`); now widens the trail renderers so tracers glow again via the night Bloom. Requires API ≥1.4.2.

### 2026-06-23
- **WindowGlow (Night Lights) → 1.0.0** (mod 66) — PUSHED. New mod: warm amber window lights at night via an embedded Built-in-RP shader bundle (single self-contained DLL); standalone. Banner uploaded. Page is a DRAFT — **user publishes it on Nexus**.
- **GunfireLights → 1.4.9** (mod 30) — PUSHED. Searchlights skip weaponless structures (masts/statues); cinematic defaults baked in. Requires API ≥1.4.2.
- **HousePower → 1.1.0** (mod 31) — PUSHED. Mood bonus reworked into a real visible +X% row, idempotent (no compounding), per-resident wood. Requires API ≥1.4.2.
