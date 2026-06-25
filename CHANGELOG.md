# Changelog

All notable changes to IFZMods are recorded here. Newest at top.

Format: `YYYY-MM-DD` headers + bullet list per release. Each bullet names the mod(s) affected.

---

## 2026-06-26 — NoPath - YesPath (new mod)

### Added
- **NoPath - YesPath 0.2.0 — new mod.** Demolish the **"no path" buildings along the water** that you normally can't get rid of. When you order a demolish on one, the mod opens the building's own footprint to pathing and **injects a reachable work position onto it**, so a real worker walks in and tears it down under normal vanilla rules (real worker, normal timing — no instant teardown). It also logs a per-building diagnostic: buildings on a land ledge are **fixable**; buildings sitting literally on water are flagged as true isolates (no worker can ever reach those — an engine limit, not fixable without breaking vanilla rules). Zero Harmony (Zenject signal + reflection), Wine/Proton-safe. Requires IFZ Mod API 1.4.3. Thanks to Meefstick (GZW) for the report and the "demolish from the inside" idea, and for in-game testing.

---

## 2026-06-24 — Buildable Bridges (new) + API 1.4.3 + Surrounded 0.4.3 + CinematicFX 1.2.0

### Added
- **Buildable Bridges (Experimental) 0.1.0 — new mod.** Drag-build a walkable bridge across water using the wall tool (hotkey **B**). It reuses the game's own wall pipeline (drag, snap, cost, save/load) and per segment lays the wall flat, lifts it to bank height, drops its collider, suppresses its navmesh cut, and stamps a walkable road deck that links shore to shore. Bridges persist across save/load. **Experimental:** units visually clip through the flat panels (the deck is the real walking surface), uneven banks snap to the higher side, and it borrows the wall build UI/costs. Standalone-ish: requires IFZ Mod API 1.4.3.

### Fixed
- **IFZ Mod API 1.4.3.** Fixes the clock briefly showing day `0` (e.g. "0 July") right after loading a base-game save — the day-counter restore fired an engine event that vanilla paints as the day, even when the value hadn't changed; it now skips that no-op. Gameplay day was always correct (this was the clock label only). Internal change with no public API surface change — older mods are unaffected.
- **Surrounded 0.4.3 — late-game swarmpile FPS fix.** On very long saves, tens of thousands of infected could pile up live at the HQ (swarms stranded at sunrise, plus the game de-virtualising a swarm's whole roster at once) and drop the game to ~1 FPS. A new SiegeRelief system throttles how many infected are made "live" at once (the surplus stays cheap and drip-feeds in), culls the roaming overflow, caps concurrent swarms, and throttles the radio spam; the HUD now shows the real live count. FPS went from ~1 to ~25–40 on the day-253 test save. Requires IFZ Mod API 1.4.3.

### Changed
- **CinematicFX 1.2.0.** Tracers reworked onto a shared additive material so they actually glow under the night bloom instead of clamping to a flat white line — warm tint, tail-fade, uniform width — plus a PauseFreeze that holds in-flight tracers still while the game is paused for screenshots. Requires IFZ Mod API 1.4.3.

---

## 2026-06-23 — Surrounded 0.4.2 (hotfix) + CinematicFX 1.1.4

### Fixed
- **Surrounded 0.4.2 — runaway horde hotfix.** On long saves the game's own `HordeSizeMultiplier` (normally a small difficulty setting) comes back corrupted and massively inflated (~2.9×10⁸ around day 250), which pinned every swarm to its maximum size and compounded aggro into endless max-tier hordes — the "way too much infected in one spot" megablob. A new **`MaxHordeMultiplier`** (default 3, set 0 to disable) clamps that value at the source so all swarm logic sees a sane number. The clamp runs even with the siege boost turned off. Requires IFZ Mod API 1.4.2.
- **CinematicFX 1.1.4 — tracers glow again.** The tracer buff was a silent no-op: it targeted a `LineRenderer`, but bullet tracers actually render through a `TrailRenderer`. It now widens the trail renderers, so tracers are thick and HDR-bright again and feed the night bloom. Requires IFZ Mod API 1.4.2.

---

## 2026-06-23 — WindowGlow 1.0.0 (new) + GunfireLights 1.4.9 + HousePower 1.1.0

### Added
- **WindowGlow (Night Lights) 1.0.0 — new mod.** Warm amber window lights on buildings at night. It reconstructs the game's exact window placement and draws a second additive, moonlight-immune emissive pass on top, with a patchy `LitFraction` so only some windows light (a realistic lived-in look). Ships as a single self-contained DLL — the shader bundle is embedded, no loose asset to install. Standalone (no API required).

### Fixed
- **GunfireLights 1.4.9.** Searchlights no longer attach to radio masts or supporter statues — those carry a defence module but no weapon, so they were wrongly treated as towers; a real tower is now detected by its gun hardware. Cinematic defaults (warm 3000K cone, slow sweep, subtle shaft) are baked in so a fresh or reset config no longer reverts to a harsh white cone. Requires IFZ Mod API 1.4.2.
- **HousePower 1.1.0.** The powered-homes mood bonus is now a real, visible effect — it shows as a green `+X% Powered homes` row (default +10% at full power, scaled by the powered-resident share). Previously it was applied at a microscopic value and never actually moved mood, and an older path could compound it; the write is now idempotent. Wood fuel scales per resident (a packed high-rise burns more than a shack). Requires IFZ Mod API 1.4.2.

---

## 2026-06-23 — API 1.4.2 + Surrounded 0.4.1 (expedition day-counter)

### Fixed
- **IFZ Mod API 1.4.2 — expedition day-counter restore.** On load the game restores Day/Month/Year but **not** `DaysFromPreviousGames`, so a run continued from an expedition collapsed its day read-out (e.g. "182 (8)" → "182") and spiked day-scaled systems as if the base were 182 days old. The API now mirrors and restores that field on load and exposes **`Time.RunDay`** (this run's own age, inherited days stripped) for day-scaled mods. Patch over 1.4.1. Update from 1.4.1.

### Changed
- **Surrounded 0.4.1.** The difficulty ease-in ramp and the F1 status read-out now use **run-day** (`Time.RunDay`) instead of absolute day, so a continued expedition eases in over the current run instead of jumping straight to the inherited day count (which previously triggered a heavy siege on load). **Now requires IFZ Mod API 1.4.2.**

---

## 2026-06-23 — Lighting wave + Quality-of-Life split

**Update all of these together — they require IFZ Mod API 1.4.1.** Older mod versions crash with the new API.

### Added
- **High Ground 1.0.0 — new mod.** The height/elevation features split out of the QoL bundle into their own mod: **TallBuildings** (raise the custom-building height cap to build high-rises), **ElevatedFiring** (garrisoned units fire from the top floor, over your walls), **HeightAdvantage** (fight-range bonus scaled by building height). Standalone — no API required.
- **Clay Pit Fixes 1.0.0 — new mod.** The clay-pit features split out of the QoL bundle: depleted clay pits **regenerate** production after a delay (default 14 days, ~50% output) and a depleted pit can be **demolished** to reclaim the land. Standalone — no API required.

### Changed
- **IFZ Mod API 1.4.1.** Adds shared cinematic bloom/glow + volumetric light-shaft helpers, pause-aware timing, and an event-driven tower/antenna registry that replaces a per-frame scene scan. Still the sole patcher of shared game systems.
- **GunfireLights 1.4.8.** Cinematic bloom/glow on muzzle flashes, explosions and tower lamps; Kelvin-tinted searchlights with volumetric light-shafts; pause-aware VFX (flashes/sweeps freeze with the game).
- **IFZ Quality of Life 1.5.1.** Height/elevation and clay-pit features moved out to the new **High Ground** and **Clay Pit Fixes** mods (install those if you want them). Remaining in the bundle: TowerHMG, VehicleAmmoFix, BuildingIconToggle, ShellLairs.
- **DarkerNights 1.1.7, CinematicFX 1.1.3.** Rebuilt against IFZ Mod API 1.4.1.

### Fixed
- **GunfireLights tower searchlights.** Towers no longer emit light while still under construction — the lamp lights only once the tower is finished. Lamp height is now recomputed live, so AnchorHeightOffset / LowStructureLift / the new SingleTowerExtraLift apply in real time from F1. Single-gun towers (wooden/metal/fortified) mount their gun mid-body, so they now get a dedicated extra lift to crown the tower; double towers and bunkers are unaffected.

---

## 2026-06-21 — HouseRebalance 1.1.0 + MassDeconstruct 1.2.0

### Added
- **MassDeconstruct 1.2.0 — category filters + safer arming.** The drag-box now filters by category — buildings, walls, barbed wire, gates, towers — each independently toggleable, so you can mass-deconstruct just walls without touching buildings (and vice-versa). Adds an owned-only filter and a **Ctrl** modifier on the hotkey to prevent accidental arming. Requires IFZ Mod API 1.2.1+.

### Changed
- **HouseRebalance 1.1.0 — PinWhenStable.** Once a citizen settles into suitable housing, the rebalancer now leaves them alone instead of repeatedly re-evaluating stable residents each sweep — less churn, fewer needless relocations. On by default (`[General] PinWhenStable`).

---

## 2026-06-21 — Cross-mod crash fixes (Linux / Proton / Steam Deck)

### Fixed
- **Pack-wide: eliminated the cross-mod crashes that hit Linux/Proton/Steam Deck players running multiple IFZ mods together.** Under Wine, when two BepInEx mods place a Harmony patch on the *same* game method, MonoMod regenerates the combined trampoline and the regenerated copy comes back with no IL body (`BadImageFormatException: Method has zero rva`), which throws when the method is first called and takes the game down via its bug-reporter. It never reproduces on native Windows, so the colliding mods looked fine for most players while silently crashing Linux users. Several shipped mods were independently patching the same game controllers and methods. The shared **IFZ Mod API** is now the **single** patcher of every shared target and hands the data to the other mods through caches/events, so no method is ever patched twice. An exhaustive sweep of all shipped mods confirms zero remaining shared-method collisions. **Update the whole set together** — every mod below now requires **IFZ Mod API 1.2.1**.
  - **IFZ Mod API 1.2.1** — sole patcher of the shared game controllers, plus new shared hooks for explosions and squad orders/size.
  - **CinematicFX 1.1.3 + GunfireLights 1.3.32** — explosion VFX now both go through one shared explosion hook (previously both patched `Explosion.Explode` → crash if you ran both).
  - **SquadMerge 1.1.2 + VehicleSquadSize 1.1.2** — now coexist: both register with shared squad hooks instead of double-patching the same squad methods (previously crashed if you ran both; they cover different features — infantry merging vs vehicle capacity — and are meant to be used together).
  - **HousePower 1.0.3, IFZ Quality of Life 1.3.2, SquadAutoBehavior 1.1.2, DarkerNights 1.1.7, PerfPack 1.5.1, Hives 0.1.6, Raider Escalation 1.2.5** — read the shared game controllers from IFZ Mod API instead of each re-patching their constructors. (Raider Escalation 1.2.5 = the live 1.2.4 raid features + this crash fix.)
  - No gameplay or visual changes — purely a stability/compatibility fix. Native-Windows users were unaffected either way.

### Changed
- **PerfPack 1.5.1 — adds an in-game performance HUD.** Toggle with **F10** (configurable). Native-styled overlay showing main/render thread time, draw calls, and live game-entity counts (infected, groups, swarms, spawn points, buildings) to see what's loading the frame. Off by default; zero cost when hidden.
- **Flares 0.2.0 — finalised flare look.** Brighter amber illumination light, a real native smoke plume, and a soft additive glow. Requires IFZ Mod API 1.2.1+. (Note: BepInEx persists config defaults, so existing users keep old values — delete the `[Flare]` lines from the .cfg or raise them in F1 for the new look.)

---

## 2026-06-21

### Added
- **SwarmFix 1.1.0 — restores late-game infected night waves that silently stop.** On long saves (~day 200+) the infected swarm waves quietly stop spawning while raiders keep attacking — the tell. Root cause (vanilla): `SwarmSpawner` compounds its aggro value every evaluation (`aggro += aggro * modifier`), so over a long game it grows past the highest swarm tier's `MaxAggroPoints` (here 9,999,999) all the way to `+Infinity`; the save format can't store Infinity, so on reload it comes back as `NaN`. The wave dispatch calls `SwarmConfig.GetSwarm(aggro)`, which only matches a tier where `Min <= aggro <= Max` — with aggro at Infinity, NaN, or simply past the top tier, **no tier matches, `GetSwarm` returns null, and no wave is ever dispatched again.** A Harmony prefix on `GetSwarm` sanitises the lookup so a tier always resolves: finite in-range aggro is untouched (healthy saves keep normal scaling), legitimately over-max aggro clamps to the top tier, and corrupted aggro (NaN/Infinity) falls back to `GarbageHordeScale x top tier` (default 1.0 = max horde; tunable down live in F1). Lookup-only — the stored/serialized aggro is never modified, so it's non-destructive and reversible. Confirmed in-game: dead waves became hordes assaulting HQ again across multiple nights. *(Reportable to the devs — unbounded aggro compounding overflows the tier table.)*

### Changed
- **SaveUnlock 1.0.1 — `Verbose` diagnostic logging now defaults off.** A surgical pass on the zero-user-overhead rule found `SaveUnlock`'s `[General] Verbose` defaulted **on**, writing a log line on every save-load. Now defaults **off** (the toggle stays for diagnosing). One line per load, so negligible, but no shipped mod should log by default. No gameplay change; existing configs keep their value (flip it off in F1). *(The heavier per-frame debug spam some saw in BepInEx logs came from dev-only mods that don't ship — those defaults were hardened too, but no released mod was affected.)*
- **CinematicFX 1.1.1 — punchier combat visuals.** Bumped the defaults to match the new banner: bullet tracers wider (`Tracers/WidthMul` 2.0 → 3.0) and blood splashes bigger (`Blood/ParticleScale` 1.8 → 2.4). No new subsystems, no perf change. Note: BepInEx persists config defaults, so **existing users keep their old values** — delete the `[Tracers]`/`[Blood]` lines from the .cfg (or raise them in F1) to get the punchier look.
- **Flares 0.1.9 — brighter, more vivid flare glow.** Bumped the illumination-flare light to match the new banner look: `Brightness` 8 → 12, `LightRadius` 60 → 66 m, and the colour nudged from deep red toward amber (`ColorG` 0.25 → 0.32, `ColorB` 0.15 → 0.18) for more of an illumination-flare read. Still a single pooled point light per flare, capped at `MaxActive` 4 — perf profile unchanged. Note: BepInEx persists config defaults, so **existing users keep their old values** — delete the `[Flare]` lines from the .cfg (or raise them in F1) to get the brighter look.
- **GunfireLights 1.3.2 — more dramatic muzzle flashes.** Bumped the default night gunfire lighting so every shot throws a bigger, brighter warm light pool: muzzle `Intensity` 3 → 5.5, `Range` 8 → 11 m, `Lifetime` 0.12 → 0.14 s, and the explosion flash up (`Intensity` 6 → 8, `Range` 25 → 28 m). All still pooled vertex lights (no shadow casting) so the perf profile is unchanged; the searchlight-cone policy is untouched. Note: BepInEx persists config defaults, so **existing users keep their old values** — delete the `[Muzzle]`/`[Explosion]` lines from the .cfg (or raise them in F1) to get the punchier look. *(Tracer streaks are CinematicFX's department, not this mod.)*
- **SquadAutoBehavior 1.1.1, Flares 0.1.8, SquadMoveFire 0.1.3 — zero-user-overhead pass: removed default-on debug logging.** Audited every shipped mod for per-user runtime cost (profiling / debug spam / recurring scans). Three had diagnostic logging enabled by default: **SquadAutoBehavior** logged per-squad decisions every 8s (`Verbose` defaulted true), **Flares** logged per-tick flare diagnostics every ~3s (`DebugLog` defaulted true), and **SquadMoveFire** had a stray `Debug.Log` in its move-fire Harmony prefix (only reached under the experimental, default-off `MoveAndFire` toggle). All now default **off** / removed — no log spam during normal play, no gameplay change. The toggles remain for diagnosing. *(Profiling/sampler instrumentation already lives in a separate dev-only plugin that never ships; the rest of the shipped mods audited clean.)*

### Fixed
- **HousePower 1.0.2 — fixes the constant frame hiccups several users reported (present even at game start, small map, minimal settings).** The chimney-smoke feature clones an existing in-game worksite-smoke particle system, which it found via `Object.FindObjectsOfType<Smoke>()` — a **full-scene object scan**. That scan only cached on success; when **no smoke existed in the scene yet** (the normal state early game — nothing is being built/repaired) it returned without caching, so each residential building re-ran the whole-scene scan from its 2 Hz visual tick — i.e. **every house scanning the entire scene twice a second, forever**, until some smoke happened to appear. Even a small map has dozens of houses, so this was a steady storm of full-scene scans = the constant hiccups, independent of map size or game stage. Fix: the scan is now **throttled globally to once every 10 s and cached on first success** (so it still picks up a smoke source once one exists), the deprecated `FindObjectsOfType` is replaced with the sortless `FindObjectsByType(FindObjectsSortMode.None)`, and buildings that legitimately get no smoke (high-rises with no chimney/roof) are marked resolved so they stop retrying their per-house prop scan. No gameplay or visual change. *(Reportable pattern — a missing-but-expected object turning a cache-on-success lookup into an unthrottled per-instance scene scan.)*
- **GunfireLights 1.3.3 + CinematicFX 1.1.2 + IFZ Mod API 1.1.1 — combat VFX now freeze when the game is paused, so you can screenshot a paused firefight.** IFZ pauses the world by setting `TimeController.SpeedMultiplier` to 0 — it never touches Unity's `Time.timeScale` — so any effect aged off `Time.time` / `Object.Destroy(go, t)` kept running full-speed while "paused" and vanished before you could capture it. The shared **IFZ Mod API** gains a `Time.IsPaused` helper and its pooled point-light flash now accumulates game-time (frozen while paused) instead of wall-clock. **GunfireLights** muzzle and explosion lights and **CinematicFX**'s demolish dust use the same gate, so they hold lit/visible while paused and resume on unpause. No gameplay or perf change; defaults untouched. Note: tracers and blood are the game's own particle systems (CinematicFX only amplifies them), so those still simulate during pause — the lights and owned dust are what freeze. *(Update all three together — GunfireLights 1.3.3 and CinematicFX 1.1.2 require API 1.1.1.)*

---

## 2026-06-20

### Fixed
- **Hives 0.1.5 — clearing a hive/lair and then entering or standing next to that building no longer crashes (Meefstick report).** Because Hives places infected lairs on *ordinary* buildings (vanilla lairs sit on dedicated structures), clearing one and interacting with it tripped two game-side null-dereferences that vanilla never reaches and that spammed crash reports every frame: (1) a worker entering the cleared lair to scavenge → `ResourcesToFindProvider.Get` → `Hideout.GetRewardResources` does `Draft.RewardResources.Count` on a list that's **null** for infected drafts (`addRewardResources=false`); (2) squads beside the cleared building auto-reacting → `RunAwayFromEnterableHandler.RunAwayFromEnterable` calls `hideout.Building.GetClosestEntrance` where `hideout.Building` is **null** on an orphaned/stacked lair. Two Harmony prefixes guard both (empty reward list; skip the run-away on a null Building) — no-op on healthy hideouts. Includes the 0.1.4 save-load fix. *(Requires 000_IFZModAPI.)*

### Changed
- **IFZQualityOfLife 1.3.1 — ShellLairs now works from bunkers/towers too, and the building-icon toggle actually hides icons.** Select a defensive structure that has a **mortar (projectile) weapon** and right-click a revealed infected lair: the bunker lobs its own shells at the lair on its weapon cooldown (consuming its ammo) until the lair dies, leaves reach, or it runs dry — vanilla bunkers can't target buildings at all. Drives the structure's own weapon via the game's `ProjectilesController`. Toggle under `[ShellLairs] Bunkers`. Also fixes **BuildingIconToggle**: on current builds `StructureIcon.RefreshState` is an override that ignores the icon condition system, so the old approach never actually hid structure icons — it now postfixes `RefreshState` and forces the icon inactive while the toggle is on.
- **SquadAutoBehavior 1.1.0 — dry squads return to the nearest ammo source, not always HQ.** When a squad runs low on ammo outside HQ it now heads to the **nearest reachable building that actually holds ammo** (a warehouse next door beats trekking back across the map), and only falls back to a `GoToHq` order when no closer ammo source is reachable. The game refills ammo on entering any storage building, so a plain move-to-building order rearms them on arrival. Less cross-map babysitting.

### Fixed
- **Flares 0.1.7 — flares now clear fog again after a save-load (they were dying at the top of their arc).** On a fresh launch flares parachuted down and carved fog correctly; after loading a save in the same session they fired, reached the burst point, then vanished — no descent, no reveal. Cause: the fog-of-war reveal cached its two engine sinks (`FogOfWarObserversCountFinder` / `FogOfWarUnitsVoid`) in static fields and never re-resolved them. Those are game-session singletons (disposed on scene unload); after a reload the cached refs pointed at **disposed** objects, so the per-frame reveal threw a `NullReferenceException` on the flare's first descent frame and the flare self-destroyed. The reveal now re-resolves the live sinks each tick, self-healing across any reload. *(Requires 000_IFZModAPI.)*
- **Hives 0.1.4 — fixes a save-load crash (NullReferenceException) on saves with a revealed hive.** Loading a save that contained a *revealed* Hives hideout could crash during load (`BuildingHideoutState.Enter` NRE) — the save won't reload at all. Cause: a Hives hideout sits on an ordinary building, so on load `HideoutsController` runs a *redundant* `ChangeTo(Hideout)` whose `Exit()` clears `building.Hideout` immediately before `Enter()` re-reads it (a game-side ordering bug only exposed by hideouts on ordinary buildings). A Harmony prefix restores the reference from the state itself before `Enter` runs — no-op on healthy loads. **This recovers saves already bricked by 0.1.3:** update the DLL and the save loads again. *(Requires 000_IFZModAPI.)*
- **PerfPack 1.4.1 — late-game / night FPS doubled by LODing hideout patrol spawn points (same horde, attacks intact).** Measured on a day-193 save: night sat at ~12-13 FPS. Root-caused with the bundled sampler to **one** system — `GroupSpawnPointsController.CustomUpdate` at ~25 ms/frame (≈70% of all game-sim). A hideout-heavy map accumulates tens of thousands of *dormant patrol spawn points* (here **19,259** across 77 hideouts, ~334/hideout — the game's own per-difficulty cap, **not** a leak: the invariant `count ≤ sum(MaxPatrolsCount)` held). These points are the game's lightweight "virtual" form of a patrol (activation is fog-of-war driven), yet the base game **moves every one every frame** (path-move + terrain raycast `UnitySampleHeight`) *and* leaves a `SphereCollider` live on each even though it's debug-mesh / editor-gizmo only (no triggers; activation doesn't use it) — 19k *moving* colliders also churned the physics broadphase. PerfPack now: (1) **distance-LODs the movement** — off-screen points run `UpdatePosition` every Nth frame with `GameplayDeltaTime` scaled ×N so roaming distance stays time-accurate, near-camera points untouched; (2) **disables the inert debug colliders**. **Horde size unchanged** (verified: still 19,259 points) and **swarms attack normally**. Result: night ~12-13 → **~28 FPS** with the full swarm, `GameManager.Update` 29 → 15 ms, worst spike 103 → ~50 ms — the bulk of the Unity-side win is the collider disable. Config-gated under `[SpawnPointLod]`, reversible. **1.4.1 fix:** 1.4.0 staggered the whole `CustomUpdate`, which also carries the per-frame fog handshake that *activates* patrols — off-screen patrols stopped activating, so swarms thinned (and FPS looked artificially higher, ~50). 1.4.1 staggers only the movement; fog + despawn tick every frame, so attacks are back to full. *(Reportable to the devs — especially the debug colliders left active in a release build.)*

### Changed
- **IFZQualityOfLife 1.3.0 — ShellLairs is now a native right-click instead of a hotkey.** Select mortar squad(s) and **right-click a revealed infected lair** to shell it — no more B key (it was colliding with other binds, and squads can already alt+click to ground-shell). The shell only triggers when your selection actually has mortars, so right-clicking a lair with plain infantry still sends them in to clear it as normal. Implemented by intercepting the move-into-building order the game issues on a building right-click. *(Bunker/tower mortar shelling is still being reworked and is not wired up in this build.)*
- **HousePower 1.0.1 + GunfireLights 1.3.1 — interior/decorative lights are now cheap vertex lights.** Realtime point lights that only need to *suggest* light (house window/door glow, antenna aviation beacons, muzzle-flash / explosion flashes) now use `LightRenderMode.ForceVertex` instead of defaulting to per-pixel — near-free at RTS zoom, removes the per-pixel fill cost that piled up at city scale and on the sunset mass-toggle. HousePower also caps interior lights per building (`[Light] MaxPerBuilding`, default 3; 0 = unlimited). Tower **searchlight cones** stay per-pixel by default (the cinematic feature — vertex bands the gradient); the existing `ForceVertexLighting` toggle still opts them in. *(Requires 000_IFZModAPI.)*

### Fixed
- **Late-game multi-second freezes / FPS hitches — root-caused to our own mods' `Object.FindObjectsOfType` scans.** `GunfireLights.FlashTicker` scanned the whole scene for defence modules + antennas every 6s (~165ms single-frame stall in a big late-game map); `Flares.FlareController` did the same for defence modules every 3s (~81ms). Both are now **event-driven** via a new shared registry — zero scene scans, identical lights/flares. Proven by a no-op A/B that the *steady* FPS floor is base-game sim+render (mods don't move it); these scans were the *hitches*, and they're gone (spike count dropped from thousands to a handful). *(GunfireLights 1.3.0, Flares 0.1.6, requires 000_IFZModAPI 1.1.0.)*
- **Hives 0.1.3 — no more re-seeding / dog-stacking on reload, and real nest variety.** The once-per-save flag keyed on `SaveInfo.Name + DateTime.Ticks`; `DateTime` is the *last-saved* time, so it changed on every autosave → the flag never matched on reload → Hives **re-seeded 12 hives every load**, stacking groups onto the same buildings (the "wall of dogs"). Now keyed on the stable map coordinates. Also: skips buildings that already host a hideout (**1 hive per building**), picks buildings **randomly across the map** (was biggest-first, which clustered them), and spawns **varied nest types** from the game's own GroupDraft→hideout mapping (`inf_human` + `inf_dog`) — the old "all dogs" was a swallowed `.First()` throw on an unmapped draft. *(Requires 000_IFZModAPI.)*

### Added
- **IFZModAPI 1.1.0 — tower defence-module / antenna registries.** `Cache.DefenceModules` / `Cache.Antennas` live lists + `*Added` / `*Removed` events, maintained by Harmony `Awake`/`OnDestroy` patches. Lets mods react to tower/antenna spawns instead of calling the O(scene) `FindObjectsOfType`. Additive — existing API unchanged.
- **PerfPack 1.3.0 — `FindClosestBuilding` cache + scheduler + opt-in diagnostics.** Caches the enemy "go to nearest building" AI scan (per-group, short TTL). Adds `PerfScheduler` (frame-budget drain queue + stagger + self-evicting TTL caches) as the foundation for future spread/throttle work. Bundles read-only diagnostics — frame-spike profiler (render/GC-tagged) and an all-mod per-method CPU sampler — **both off by default** (enable in config only while diagnosing).
- **IFZQualityOfLife 1.2.0 — ClayPitRegen.** Depleted clay pits regenerate production to ~50% of their original limit after a configurable number of game days (diminishing returns — clay doesn't fully replenish), and a depleted pit can now be demolished to reclaim the land. (Catch-up upload: 1.2.0 was built earlier but never published — the page was still on 1.1.3.)

## 2026-06-19

### Fixed
- **Hives 0.1.2 — hives no longer all-dogs.** `SeedNow` picked the infected `HideoutDraft` with `FirstOrDefault(Fraction==Infected)`, which always returned the first one (the dog nest), so all 12 hives spawned dogs. Now collects **every** infected draft and picks one at random per placement, so nest types vary across the map. Verbose logging prints the draft count + names on seed (run once to confirm how many distinct infected nests the game data defines — if there's only the dog draft, "dogs only" is the game's data, not selectable mod-side). *(Requires 000_IFZModAPI.)*
- **SplitUnlock 1.2.0 — bypass "at least one of the walls is too short".** This rejection isn't a split check — it's custom-building validation (`CustomBuildingData.WallsHasMinimalLenght` → `InvalidReason.WallSize`, any segment below `MinWallLength`). 1.1.0 already lifted the sibling area gates but not wall-length. New `BuildingSize > AllowShortWalls` (default on) postfixes that predicate so tight/irregular footprints place. Mirrors the existing area-patch pattern; angle/slope/intersection checks still apply.

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
