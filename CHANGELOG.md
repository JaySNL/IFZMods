# Changelog

All notable changes to IFZMods are recorded here. Newest at top.

Format: `YYYY-MM-DD` headers + bullet list per release. Each bullet names the mod(s) affected.

---

## 2026-06-19

### Added
- **IFZQualityOfLife 1.1.3 — ShellLairs: order mortars/squads to shell infected lairs.** Vanilla won't let you attack-order an infected lair (they're "enter to clear" only — `CanAttackBuilding` is false for them, while bandit/provirus hideouts are attackable once revealed). ShellLairs adds the option **without** flipping `CanAttackBuilding` globally (that makes the auto-combat AI shell every infected hideout in range, uninvited, and stops vehicles mid-move). Instead: select your squad(s), hover a **revealed** infected lair, and press the **ShellLairs key (default B)** — the lair nearest the cursor gets the game's own attack-building order. Lair structure HP scales with building volume, so a bigger/spread-out lair soaks more shells (the "needs more ammo" penalty is built in). Config: `ShellLairs > Enabled / Key / CursorRadius`. Captures `SquadsController`/`BuildingsController` locally (no new dependency).

## 2026-06-18

### Changed
- **Hives 0.1.1 — smarter hive placement (fixes the "everything stacked on one street" look).** 0.1.0 shuffled all qualifying buildings and dropped 50 hives into them; with each hive spawning a real infected group, 50 groups converged on one road and read as a single mega-lair conga-line. 0.1.1 reworks selection: hives now go into the **largest** buildings (new `MinBuildingVolume` gate, default 2000 — bigger building genuinely hosts a bigger hive, `volume × 0.001` extra infected), **far** from HQ (`MinDistanceFromHQ`), and **spaced apart** (new `MinSpacingBetweenHives`, default 120 m) so they scatter instead of clumping. Default `HiveCount` cut **50 → 12**. Seeding still uses the engine-valid `TryInstantiateHideout` and stays **once per save**. Gated per-hive verbose logging added for diagnostics. *(Requires 000_IFZModAPI.)*

### Fixed
- **IFZQualityOfLife 1.1.2 — building-icon toggle (I) now actually hides icons.** The toggle registered a `MapIcon.AddConditionToShow` show-condition, but `StructureIcon.RefreshState()` is an override that ignores those conditions (it recomputes visibility from the game's own rules), so the icons never hid. Reworked to postfix `StructureIcon.RefreshState` and force the icon inactive while the toggle is on (re-applied on every game refresh; new icons spawn hidden too); the keypress re-runs `RefreshState` on all live icons. (Version aligned 1.0.x → 1.1.2 to stay ahead of the published page.)

- **RaiderEscalation 1.2.4 — raiders spawn armed (replaces the stale 1.2.3 in the pack).** Raid groups were spawning weaponless: 1.2.3 read the weapon from the patrol `GroupSpawnData`, which the bandit asset leaves empty at runtime, so weapon resolution silently returned nothing. 1.2.4 reads the weapon from a camp member's actually-equipped gun (`Character.ItemsContainer.WeaponHandler.Weapon`), with a guaranteed `eq_assault_rifle` floor so a raid is never unarmed. (Pack also jumps 1.1.0 → 1.2.4: headcount/churn/reload/virtualization fixes from the 1.2.x line.) *(Requires 000_IFZModAPI.)*

### Added
- **SplitUnlock 1.1.0 — custom-building size override.** New `BuildingSize` config section exposes the draw-your-own-building size limits the game pins internally: `MaxBuildingSurface` (vanilla 1000 m²) and `MinBuildingSurface` (vanilla 5 m²). Raise the max to draw bigger custom buildings, lower the min for tiny ones. Defaults match vanilla, so it's opt-in (no change until you edit it). Implemented by re-evaluating `CustomBuildingData.IsBelowMaximalAreaSize` / `HasMinimalAreaSize` against the configured bounds. The original split-bypass behavior is unchanged. *(Only lifts the size gate — wall-length / angle / slope / intersection checks still apply.)*
- **Surrounded 0.4.0 — F1 "Status" read-out + opt-in lair lever.** New read-only **Status** section in the F1 menu shows, live, exactly what the mod is doing: **Spawn frequency** (`game gap → mod gap`, with how much more often swarms come), **Horde size** (`your difficulty slider → mod output`, ramp % for the current day), and **Lair formation** (groups + delay + chance a holed-up swarm needs to become a permanent lair). Values are the real intercepted before→after numbers, not config echoes. Lair formation is a **vanilla** mechanic (read-only by default) — but a new **opt-in** `LairFormation` section (`Enabled` off by default, `LairFormationBoost` 1.0 = no change) lets you make lairs form slower or faster, scaling `HideoutsConfig.MinGroupsAmountToLairConvert` + `ConvertDelayGts`. *(Requires 000_IFZModAPI.)*

- **Hives 0.1.0 — new infected-hive seeding mod. ⚠️ EXPERIMENTAL.** On a new game it seeds extra infected hideouts ("hives") into buildings scattered across the map (away from your HQ); they can grow into lairs over time — more scattered objectives + siege pressure. Uses the game's own `HideoutsController.TryInstantiateHideout` (engine-valid, not a hand-spawn) and seeds **once per save** (per-save flag → never re-stacks on reload; loading a pre-Hives save re-seeds with current settings). Tunable: `HiveCount` (50), `MinDistanceFromHQ`, `PlacePerTick`. Pairs with Surrounded. *(Requires 000_IFZModAPI.)*
- **IFZQualityOfLife — building-icon hide/show toggle.** New hotkey (default **I**, configurable) hides/shows **all building icons** to declutter the map, without touching the rest of the HUD; state persists across reloads. Uses the icon system's own show-condition gating (no GameObject disable, so building selection is unaffected).
- **Surrounded 0.3.0 — siege difficulty ease-in ramp.** The swarm boosts no longer hit full strength on day 1 (which could overrun a fresh base). The effective boost now lerps from vanilla on day 1 up to your full configured `SwarmFrequencyBoost`/`HordeSizeBoost` by day `RampDays` (default 30), then stays at full. New: `Siege.RampDays` (30, `0` = full boost immediately) and `Siege.RampStartFactor` (1.0 = vanilla day 1; lower for a softer-than-vanilla start). Applies to both frequency and horde-size levers, driven by `TimeController.Day`.

### Fixed
- **Flares 0.1.3 — save-bound flare stack + crash hardening.** Flare count is now **per-save** (keyed to `SaveHandler.SaveInfo`, restored from the save on load) instead of a single global per-install count that leaked across saves and showed up on a fresh launch. The counter/craft UI now stays hidden in the main menu and loading screens. And every mod callback is wrapped so an exception during save-load can't surface the game's bug-reporter window — the mod fails quietly to its log instead.

### Added
- **Flares 0.1.2 — new mortar illumination-flare mod. ⚠️ EXPERIMENTAL.** At night, bunker- and squad-mounted mortars autonomously lob an illumination flare at dark infected clusters within range; it arcs up over a tunable flight time, airbursts, and parachutes down as a red light + thin smoke trail, **revealing the fog-of-war** under it so mortars can engage the lit horde. Built as a pure driver + reflection (no Harmony).
  - **FoW reveal without instantiating an observer** — replicates `FogOfWarObserver.CustomUpdate` by pushing the flare position into the `FogOfWarObserversCountFinder` + `FogOfWarUnitsVoid` singletons (refs pulled from a live squad observer). Reveal holds full radius for the flare's whole burn, so **one flare = one engagement window** (no over-flaring).
  - **Detects bunker/tower mortars**, not just squads — `StructureDefenceModule.SelectedWeapon` flagged ground-attack + explosive; targets infected from `Cache.Groups` within the weapon's reach. Filters to `Fraction.Infected` (skips neutral wildlife).
  - **Separate flare ammo stack** (a true new resource isn't moddable — `ResourceID` is a baked enum), tracked mod-side and **crafted from HE ammo (1 → 5)** via a **draggable, native-TMP-styled panel** (borrows the game's font; shows only in-game). Lifetime/descent run on game time, so flares freeze on pause and scale with game speed.
  - **Fixes since first cut:** craft button no longer crashes the game (was `ForceRemoveResource` corrupting resource state → next-frame exception → BugDetector; now uses the safe `TryRemoveResource` on the stockroom container, fully guarded); panel no longer shows in the main menu. *(Requires 000_IFZModAPI. Pairs with DarkerNights.)*

## 2026-06-17

### Added
- **SquadMoveFire 0.1.2 — vehicles now fire while driving.** The move+fire patch only covered infantry; vehicles were gated by `CanExecuteAttackInVehicle()` (false on a move order), so a driving squad never auto-fired. Now forced true when `MoveAndFire` is on — the vehicle attacks in-range targets via the same no-movement `AttackGroup` path while its move order keeps it rolling = drive + fire. (Still ⚠️ testing; `MoveAndFire` defaults off.)
- **SquadMoveFire 0.1.1 — "Hold Your Ground" now truly anchors a squad.** Requested follow-up: with the **Hold Your Ground** stance ON, ordering a squad to attack a target made it *advance* toward that target anyway. Now, when Hold Your Ground is active, the squad **stays put and only fires what's already in range** — it won't move to engage. A normal move order still moves them. Uses the existing stance button (no new UI); implemented by forcing `CharacterFightHandler.ShouldMoveToEnemy()` false under the `HoldYourGround` stance. Toggle: `HoldGroundAnchors` (default on).
- **Pre-bundled `manual-install/` folder — no-script, one-copy install.** For users blocked by Smart App Control or antivirus: the folder contains BepInEx 5.4.23.2 **and** every mod in the final game-folder layout. Download the repo ZIP, copy everything inside `manual-install/` into the game folder, launch. Nothing is executed, so SAC/AV can't block the *install* (it can still block the loader from *running* — that still needs SAC off).
- **One-click `install.bat` for non-technical Windows users.** Download it, double-click — no PowerShell, no commands, and it sidesteps the `"running scripts is disabled on this system"` execution-policy error people hit when running `install.ps1` directly (it invokes PowerShell with `-ExecutionPolicy Bypass`). It runs a local `install.ps1` if present, otherwise pulls the latest from GitHub.
- **`install.ps1` is now self-sufficient.** When run standalone (raw download, or `irm … | iex`) with no local `plugins\` folder, it downloads the repo from GitHub and installs from that — so grabbing just the script works.
- **SquadMoveFire 0.1.0 — new move-and-fire + accuracy mod. ⚠️ TESTING ONLY.** Squads currently halt to shoot; this lets them fire on the move, with a damage-based "accuracy" model layered on top.
  - **Move + fire:** native IFZ gates attack-while-moving behind the Fire-at-Will + Move-at-Will stances but then always pauses to shoot (`IdleState.CanPauseOrderToExecuteAttack`). This forces the no-pause branch so the squad keeps moving while firing. Enable both stances on the squad.
  - **Accuracy = damage:** IFZ ranged combat has no hit/miss roll (damage is deterministic distance falloff), so penalties are applied as a multiplier on `CharacterFightHandler.GetDamage`. Movement penalty (walk → run lerp, separate driving penalty), a **hard swimming penalty**, an **indoor confidence bonus**, and an **open-field swarm-panic penalty** scaling with nearby infected. Melee exempt from the movement penalty by default; all factors tunable in F1.
  - **Status:** experimental — pending in-game confirmation that squads truly keep moving while firing (watch the stop-to-shoot cooldown) and balance tuning. **MoveAndFire defaults OFF** after a suspected hard crash; enable it alone to test.

### Fixed
- **Surrounded 0.2.2 — `Loot.Multiplier` now also scales EXPEDITION loot** (reported by Furippu). It was only lifting building scavenge. Root cause: `ResourcesToFindProvider.DrawResourcesForTag` has two yield paths — the scavenge path multiplies by `amountMultiplier` (which the mod scaled), but the expedition path computes `resourceAmount = (int)(min + max/2)` and **ignores `amountMultiplier` entirely**. Since `min`/`max` are proportional to `cubicMeter`, the loot prefix now also scales `cubicMeter` when `expedition == true`, so expedition yield rises with the same multiplier.

## 2026-06-15

### Added
- **MassDeconstruct 1.0.0 — new drag-box mass-deconstruction mod.** Vanilla only lets you deconstruct one building at a time via its panel. This adds a marquee: press **K** (configurable hotkey) to arm, drag a rectangle over the map, confirm the building count in a dialog, and every qualifying building inside is queued for deconstruction at once. Right-click / Esc cancels.
  - Per-building trigger is the engine's own `Structure.StartDeconstruction()` (the same call the deconstruct button fires), so workers pick the jobs up normally.
  - Selection mirrors the game's deconstruct-button gate — skips the HQ, non-deconstructable structures, and anything already being torn down — with a `PlayerBuildingsOnly` toggle (default on) so a wide drag doesn't queue the whole abandoned city. The confirmation dialog shows the count before committing.
  - Self-contained input (own marquee + IMGUI confirm); it does **not** touch the game's AreaWork cursor, so it can't conflict with the scavenge/gather tools. *(Requires 000_IFZModAPI.)*

## 2026-06-14

### Added
- **Surrounded 0.2.1 — new "Surrounded" siege game-mode mod.** Turns the map into a sustained siege: the vanilla swarm attacks more often and bigger, and building scavenge loot is multiplied so you're pushed out to forage between assaults.
  - **Siege** drives the game's OWN swarm system by scaling two difficulty multipliers it already reads live: `SwarmsIntensity` (a spawn-delay multiplier → divided by `SwarmFrequencyBoost`, default 2× more frequent) and `HordeSizeMultiplier` (group size + a secondary frequency boost → ×`HordeSizeBoost`, default 1.5). The swarms are fully engine-built — correctly targeting and zero extra crash surface.
  - **Loot** multiplies scavenge yield via `ResourcesToFindProvider` (`Loot.Multiplier`, default 2.5×).
  - All tunable in F1: `Siege.SwarmFrequencyBoost`, `Siege.HordeSizeBoost`, `Loot.Multiplier`, plus master/section toggles.
  - **Dev note:** an earlier approach that hand-spawned hordes via `VirtualGroupsController.Create` was abandoned — the free spawn path produces engine-invalid groups (uninjected `LairFinder` → per-frame NRE crash) and races save-load. Steering the native swarm multipliers is the correct, crash-proof lever. (See MODDING_NOTES.md.)

## 2026-06-13

### Fixed
- **DarkerNights 1.1.6 — live night-brightness control + dawn/dusk flicker.** Editing the night sliders in the F1 menu appeared to do nothing. Walked it down with an in-game read-back diagnostic (`Debug.Verbose`):
  - **Real root cause — config edits weren't applied at a stable time of day.** The driver only re-applied at 12.5 Hz *and* the levers it drove were the wrong ones. Two structural fixes: the driver now (a) re-applies on the very next frame after any edit (`Config.SettingChanged` force-apply) and runs every frame during the sunrise/sunset transition (kills the **dawn/dusk flicker** — the game rewrites grading each frame in that window and our 12.5 Hz writes were bleeding through); and (b) day-tone (saturation/contrast/warmth) is written straight into the live `colorGrading` each tick instead of ColorSwitcher's `*_Day_PP` source fields, which the game only consumes during transitions.
  - **`ExposureEV` is inert in this build — replaced by a working night-brightness knob.** The diagnostic proved our AutoExposure write landed (`liveAEmin` tracked the config, `overrideState`/`enabled` both True) yet had **zero** visible effect — AutoExposure simply doesn't drive the image in this IFZ build. **`NightSunFactor` is now the live night-brightness control:** it drives the real directional sun/moon `Light.intensity` every frame against the game's captured base, so it renders reliably (real light, not post-process) and applies live. `ExposureEV` is kept but documented as ineffective here.
  - **Removed dead knobs.** `NightAmbientColorMul`, `NightAmbientFactor`, and `NightExposureBias` were bound but never effectively rendered (vestiges / overridden) — gone. Night ambient = `NightAbsolute.AmbientR/G/B` (atmospheric fill/tint, `ambientMode=Flat`); night brightness = `NightSunFactor`.
  - Runtime-disable now restores the sun light + grading tone to vanilla (no flat/stuck image after a stable-time toggle-off).

## 2026-06-12

### Added
- **RaiderEscalation 1.1.0 — dynamic raider camps that grow, weaken, recoup, raid, and pay out.** New mod on the engine's Hideout/Lair system (in IFZ a "Hideout" *is* a "Lair" — one system keyed by `Fraction`; `HideoutsController.HideoutCleared` fires for both bandit camps and swarm nests). Built as a **homeostatic loop**, not an endless stacking ramp:
  - **Dynamic strength (raiders only).** Each bandit camp carries a continuous `Strength` (effective tier = floor). It **grows** `GrowthPerDay` while healthy and left alone, but **drops** when its members die — and crucially the loss is measured by the camp's *headcount*, so it weakens whether **you** or the **infected** killed them. Taking losses (or launching a raid) forces a `RecoupDays` rebuild window with no growth, so a beaten-down camp must actually recover before it fattens again. Net result: ignore a camp and it gets scary; keep beating its raids and it stays manageable. Player controls local difficulty.
  - **Three-faction interplay.** Bandits and Infected are mutually hostile in vanilla, so raiders that march through swarm ground get thinned — and because the feedback loop reads headcount, those losses feed straight back into lowering the camp's strength. Optional `InfightChance` makes a high-strength camp sometimes raid the **nearest infected nest** instead of your HQ (territorial bandits thinning swarms and themselves) — watchable chaos you can exploit.
  - **Loot on clear (both fractions).** Wiping any raider camp or swarm nest grants a stockroom bundle (ammo + scrap + food; fuel at tier 2+, a weapon at tier 3+) scaled by the camp's strength at clear time, via `StockroomsController.Container.ForceAddResource`. Vanilla gives no clear reward (only a mood bump). A fat camp you finally crack pays big — risk/reward.
  - **Raids (raiders only, self-limiting).** Camps at `MinTier`+ march patrol groups (`MoveOrder`) at your HQ — behaviour absent in vanilla (raiders are normally reactive + leashed). Each raid spends `RaidStrengthCost` and triggers recoup, so raids can't stack endlessly. Caveat surfaced in config: groups stay leashed to their hideout, so distant camps may not reach — this dials pressure, not a guaranteed siege.
  - All gentle + fully config-gated. Depends on IFZModAPI. "Reclaim the fort as a usable building" and "bandit fortifications" remain out of scope — those need engine support (player-faction-tied building system), not a Harmony patch.

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
