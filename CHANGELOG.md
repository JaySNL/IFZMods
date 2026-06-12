# Changelog

All notable changes to IFZMods are recorded here. Newest at top.

Format: `YYYY-MM-DD` headers + bullet list per release. Each bullet names the mod(s) affected.

---

## 2026-06-12

### Fixed (reported by Vivi)
- **VehicleSquadSize 1.1.0 — "clown car" over-capacity.** A big squad (e.g. 8 from a truck) climbing into a small vehicle (a 4-seat sports car) kept showing all 8 pips — `GetMaxGroupCount` was inflated to the actual member count even inside a vehicle, so the cap never bound and the squad stayed permanently over capacity. Inside a vehicle the cap is now the **hard vehicle capacity** (`4 + floor(cargoSlots / 4)`), never inflated to the member count; the game's own seat logic then stops overfill. SquadMerge's twin `GetMaxGroupCount` postfix now also skips vehicle-bound squads so it can't re-introduce the same bug.
- **VehicleSquadSize 1.1.0 — squad panel "sliced in half / shoved up, no way to scroll back."** The expanded seat grid kept the previous squad's scroll offset: select a truck (which scrolls), scroll down, then select a small car and its panel stayed pushed up off-screen with scrolling disabled. The grid content now snaps back to the top whenever the selected squad changes, and a vehicle whose capacity doesn't need scrolling always resets to the top instead of inheriting a stale offset.
- **SquadMerge 1.1.0 — unintended merges during combat.** Right-clicking your own squad to reposition while fighting a swarm fired a merge. New `SkipInCombat` toggle (default **on**) skips merging while either squad has an enemy in view range (`EnemiesProvider.HaveEnemyInViewRange()`), falling back to the vanilla follow order so the click still does something sensible. Turn off to merge mid-fight.
- **GunfireLights 1.2.1 — tower searchlights / beacons / headlights invisible at normal zoom (regression from 1.2.0's distance cull).** The 1.2.0 `MaxRenderDistance` cull measured 3D distance from the camera, but IFZ's RTS rig sits directly above the focus at `Y = Zoom` and zooms up past `minY + 450` units — so the camera's straight-line distance to any ground tower is dominated by camera **height**, exceeding a 130 m budget at almost every zoom. Result: every searchlight got deactivated even though it was dead-center on screen (12 searchlights confirmed *attached* in the log, just culled). Cull is now an **off-screen (viewport) test** — zoom-invariant, lights visible on screen stay lit — with `MaxRenderDistance` kept only as a horizontal-distance (XZ, never camera height) backstop, default raised to 250 m. Fixes searchlights, antenna beacons, and vehicle headlights together.

---

## 2026-06-11

### Added / Fixed
- **PerfPack 1.1.0 — A\* graph-update throttle.** The game's `GraphsUpdatesQueue` dispatches up to 10 navmesh graph updates per frame on the main thread; a build / demolish / wall-damage burst lands them all in one frame → a CPU stall (this is a CPU-bound game — pathfinding *calc* is already multithreaded, but graph-update *apply* syncs on the main thread). New throttle caps it (default 2/frame, configurable) so bursts spread across frames; the navmesh just settles a few frames later. Diagnosis note: a full perf audit found the game is otherwise well-optimized — hot paths use Burst jobs + native collections, so GC/allocation tuning is a non-issue and GPU quality levers are irrelevant on capable hardware. The real mod-side wins are real-time light count (see GunfireLights 1.2.0) and main-thread dispatch throttles like this one.
- **DarkerNights 1.1.0 — winter daytime exposure + live toggle.** (1) Winter snow blew out to flat white because the normal day exposure boost was applied to the winter AutoExposure/grading too; winter now has its own darker `DayExposureBias` (default -1.5) plus contrast/saturation on the winter grading path, so snow stays readable. (2) The F1 `Enabled` toggle now reverts live — disabling restores the cached vanilla source fields / grading / ambient instead of leaving our baked-in boosts stuck (it previously early-returned and did nothing visible). Value sliders were already live; this closes the toggle gap.
- **GunfireLights 1.2.0 — searchlight performance.** Tower searchlights spawned one real-time spot light *per gun muzzle per tower* → pixel-light overdraw → ~2× FPS hit at night with many towers (77→31 FPS observed). Now one light per tower by default (`OneLightPerTower`), plus camera distance-culling (`MaxRenderDistance`, default 130m) and an optional cheap `ForceVertexLighting` mode, applied to searchlights, antenna beacons, and vehicle headlights.

### Fixed
- **GunfireLights 1.1.0 — crash on older saves with defence towers (beta API break).** The 0.26.6 beta renamed/removed `StructureAttackPerformer.LastAttackedGroup`; the tower-searchlight code called it directly, throwing `MissingMethodException` every frame once any defence tower exists → the critical-error reporter tripped. New games didn't hit it until a tower was built. Now reads the property via reflection — present on stable → searchlight tracks the last-attacked target; absent on beta → graceful idle-sweep. **One DLL works on both beta and stable**, no separate builds.
- **Crash loading older saves (SmartWorkerRedist + IFZQualityOfLife).** `WorkBase.CanExecute()` NREs deep in `ProductionData.GetProfitPairs()` when a production building's draft data is incomplete — which happens on saves from older game versions loaded past the version gate (e.g. via SaveUnlock). The exception escaped our per-tick work scans and tripped the game's critical-error reporter; new games were unaffected (fresh draft data). Guarded all three `CanExecute()` call sites (SmartWorkerRedist `RedistDriver`, IFZQoL `WorkController.CustomUpdate` rewrite, IFZQoL `SmartWorkerRedistribution`) to skip malformed works instead of throwing.

### Added
- **IFZModAPI** (`000_IFZModAPI.dll`) — new shared library, always loads first (filename prefix + `BepInDependency`). Extracts patterns duplicated across mods: controller-instance cache (Buildings / Groups / Squads / Stockrooms / Work / ColorSwitcher / Weather / Light), Time helpers (Hour / Sunrise / Sunset / IsNight / NightBlend), Vfx helpers (real `Smoke._smoke` prefab clone, pooled point-light flash), cached reflection, and a PostProcessing FloatParameter shim. ArmyBackup, SmartWorkerRedist, and CinematicFX now depend on it instead of carrying their own copies.

### Changed
- **CinematicFX → 1.1.0: BurningStructures (smoke/fire on damaged buildings) removed and pinned.** The game ships no persistent fire asset and only a small chimney-scale smoke particle system, so a convincing "building heavily damaged / on fire" effect can't be assembled from real game assets without faking it (oversized chimney puffs + a synthetic light dressed up as fire). Rather than ship something that doesn't read right, the feature is parked until either the game exposes a fire / large-smoke effect, or we ship a custom particle asset bundle. Blood, tracers, demolish dust, impact craters, and night storms are unaffected.

### Fixed
- **IFZModAPI smoke clone rendered nothing.** Root cause (found by diffing against HousePower's working chimney smoke): the prefab was sourced from `Resources.FindObjectsOfTypeAll` which returns inactive template objects, then `Instantiate` produced an inactive clone, and `ParticleSystem.Play()` on an inactive GameObject is a no-op. `Vfx.CloneSmokeAt` now sources the real `Smoke._smoke` PS and forces `SetActive(true)` + play. (Kept for DemolishDust / future use; the burning-structures consumer is pinned per above.)

---

## 2026-06-10

### Added
- **Master `Enabled` toggle on every mod.** Disable an individual mod via F1 ConfigurationManager without removing its DLL — under each mod's `General` section. Mods with subsystems (CinematicFX, PerfPack, GunfireLights, IFZQualityOfLife) keep their per-feature toggles; the master sits above them.
- **IFZQualityOfLife: per-feature toggles** — `TowerHMGEnabled`, `VehicleAmmoFixEnabled`, `HeightAdvantageEnabled` (in addition to the bundle's master `Enabled`).
- **CHANGELOG.md** — this file.

### Notes
- **LocaleFix caveat:** the Awake-time culture pin applies once at process start regardless of the toggle. Flipping `Enabled` off during a session stops the per-frame Sentinel from re-pinning but doesn't *undo* the initial pin. Restart the game with `Enabled=false` for a fully vanilla culture state.

---

## 2026-06-09

### Added
- **SplitUnlock** — new mod. Bypasses "Building parts contain too narrow or too complex elements" on building splits. Lets you cut up castles, cathedrals, and other irregular generated shapes that the vanilla validator rejects. Two independent toggles: `AllowWrongDimensions` (the narrow/complex check) and `AllowSmallSurface` (the size check). Postfixes `Gameplay.Rebuilding.Split.BuildingSplitHandler.CheckWrongDimensions`.
- **GunfireLights: fade-in transitions** — tower searchlights, vehicle headlights, and antenna beacons fade in/out across a configurable `TransitionHours` window around sunset / sunrise instead of snapping on/off. Match `DarkerNights.TransitionHours` for synced lighting.

### Performance
- **Cross-mod perf pass.** Cached reflection FieldInfo and FloatParameter `value` lookups in `DarkerNights.LightingDriver` (was re-resolving `GetType().GetField(...)` every frame). Throttled `DarkerNights.LightingDriver` to ~12 Hz. `HousePower.BuildingGenerator` visual writes throttled to 2 Hz with compare-then-assign to skip no-op light intensity / range writes. Shared `NightBlend` computed once per frame in `GunfireLights.FlashTicker`; towers, beacons, vehicles read the cached value. `CinematicFX` burning-structure scan interval 2 s → 4 s. `GunfireLights` defence-module scan 3 s → 6 s; dropped redundant `GetComponentInChildren<Antenna>` check.

### Fixed
- **install.ps1: ASCII-only.** PowerShell 5.1 (Windows default) loads `.ps1` as Windows-1252, not UTF-8. Em-dash bytes in two `Write-Host` strings decoded as garbage and broke the parser with misleading "missing terminator" errors. Replaced em-dashes with ASCII hyphens.

---

## 2026-06-08

### Added
- **DarkerNights v2** — own the day/night lighting curve. New `LightingDriver` LateUpdate writes to `ColorSwitcher` source fields (`saturation_Day_PP`, `contrast_Day_PP`, `blue_Day_PP`) so the game's per-tick lerp uses our values as the basis. Adds day tone-shaping (`DaySaturationBoost`, `DayContrastBoost`, `DayExposureBoost`, `DayWarmthBoost`) to counter dull vanilla daylight. Night ambient (`NightAmbientR/G/B`, `NightAmbientIntensity`) and AutoExposure (`AbsoluteExposure`) are absolutely clobbered, not nudged. Full-moon nights apply an exposure / sun multiplier on top.
- **SaveUnlock** — new mod. Bypasses the "Unsupported save file" version check. Loads older saves on newer game builds. Patches `VersionValidator.ValidatePlayedVersions` and `ValidateMinPlayableVersion`. Schema-breaking saves may still fail mid-load — back up first.
- **LocaleFix** — new mod. Forces `CultureInfo.InvariantCulture` on the main thread + `DefaultThreadCurrentCulture` + per-frame Sentinel re-pin. Fixes `FormatException` in ConfigurationManager's text editor when editing `.` decimal floats on comma-locale systems (nl-NL, de-DE, fr-FR…).

### Fixed
- **DarkerNights: beta 0.26.5.29 compatibility.** Game added `LightController.SetSunIntensityByTransitionStep(currentIntensity, targetIntensity, ...)` and `ColorSwitcher.SetRawNightValue(value, isWinterNight)`. Added Harmony hooks on both; routes winter-season night exposure through `_winterAutoExposure`.
- **DarkerNights: NightBlend math.** Old formula (`sinceSet < untilRise`) was true at h=11, returning night=1 during the day → pitch-black 11 am. Replaced with simple non-wrapping branches: pre-sunrise ramps down, post-sunset ramps up, daytime uses edge tails only.
- **DarkerNights: grayish daylight.** Writes now go through ColorSwitcher source fields instead of being clobbered each game tick.

---

## 2026-06-07 (and earlier)

### Added
- **Initial release: 15 mods + ConfigurationManager + cross-platform installer.**
- **SquadMerge** — right-click own squad → merge members into target (vanilla follow-only behaviour replaced for own-faction targets).
- **VehicleSquadSize** — vehicle capacity scales with cargo slots (`4 + floor(cargoSlots / 4)`). Pickup 5, Van 6, Truck 8, Bus 9. Merge-into-vehicle, split-on-exit, save/reload tested.
- **SquadAutoBehavior** — auto-medbay when wounded near HQ, auto-resupply ammo from stockroom indoors, auto-return-to-HQ when ammo runs dry.
- **ArmyBackup** — "Request Backup" Army tanks actively engage hostiles near base instead of idling.
- **ConstructionETA** — shows time-remaining on build / repair / deconstruct panels.
- **DeconstructCancel** — cancel paused deconstruction tasks (vanilla blocks).
- **ExplosivesUnlock** — force-unlocks `explosives_planting` so the open-beta demolition feature works.
- **HouseRebalance** — citizens auto-migrate to higher-priority housing when capacity exists.
- **HousePower** — powered homes get separate `+mood` bonus; chimneys emit smoke; entrance lights at night.
- **GunfireLights** — real-time point lights for muzzle flashes, explosions, vehicle headlights, tower searchlights, red/green aviation beacons on antenna towers.
- **CinematicFX** — burning structures, buffed blood/tracers, demolish dust, impact craters, night thunderstorms.
- **PerfPack** — billboard / blood-decay throttle, AI building cache (opt-in).
- **SmartWorkerRedist** — stalled construction auto-pulls workers from idle/low-priority jobs.
- **IFZQualityOfLife** (bundled) — TowerHMG, VehicleAmmoFix, HeightAdvantage.
- **ConfigurationManager** — F1 in-game tweak panel.
- **Cross-platform installer** — Windows (`install.ps1`) + macOS / Linux / Steam Deck (`install.sh`). Idempotent. README documents Proton/Wine `WINEDLLOVERRIDES="winhttp=n,b"` requirement.

---

## How to read this

- **Added**: new mod, new feature, new toggle.
- **Fixed**: behaviour broken by a beta update or a bug discovered in shipped code.
- **Performance**: changes that affect runtime cost.
- **Notes**: caveats or known limitations users should be aware of.
