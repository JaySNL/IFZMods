# IFZ Modding — Findings Tracker

Living record of what **works**, what's **broken / inert**, and **dead-ends** when modding
Infection Free Zone via BepInEx. Check here before re-investigating. Add a dated line when a new
fact is confirmed (or overturned). Newest facts can go at the top of each section.

Environment: BepInEx 5.4.23.2 + Harmony, netstandard2.1, Mono. IFZ Unity 6000.0.26, beta 0.26.6.x.
Game install: `X:\Steam\steamapps\common\Infection Free Zone`. Decompiled source:
`C:\Users\Jooshua\Projects\IFZ-Modding\Decompiled\Ifz`.

Legend: ✅ works · ❌ broken/inert · ⚠️ works-with-caveat · 🧭 how-to / fact

---

## Rendering & Lighting  (DarkerNights, GunfireLights)

- ❌ **AutoExposure (PostProcessing v2) does NOT drive the image in this build.** Writing
  `_defaultAutoExposure.minLuminance/maxLuminance.value` has **zero visible effect** even with
  `overrideState=true` AND `enabled=true` — confirmed via in-game read-back (`liveAEmin` tracked the
  config exactly, screen never changed). Do not use AutoExposure for exposure control. (2026-06-13)
- ✅ **Night brightness = the real directional sun/moon `Light.intensity`.** Reach it via
  `LightController.Light` (returns `sunLight`). A real Light always renders. This is what actually
  darkens night (DarkerNights `NightSunFactor`). (2026-06-13)
- ⚠️ **The game only sets sun intensity on time/weather transitions** (`UpdateLightSettingsInstant`
  → `SetSunIntensity`), NOT every frame. So a Harmony prefix on `SetSunIntensity` only fires at
  transitions → edits look frozen at a stable time of day. Fix: capture the base intensity in the
  prefix, then **re-apply every frame from your own driver** (LateUpdate). (2026-06-13)
- ⚠️ **`RenderSettings.ambientMode == Flat`.** So `RenderSettings.ambientLight` (color) IS the
  ambient and renders; `RenderSettings.ambientIntensity` is **ignored** by Unity in Flat mode. Drive
  ambient via `ambientLight` color (DarkerNights `NightAbsolute.AmbientR/G/B`). Ambient reads as an
  atmospheric/fog wash, not a flat brightness. (2026-06-13)
- ⚠️ **ColorSwitcher consumes its `*_Day_PP` / `*_Night_PP` source fields into `colorGrading` ONLY
  during the sunrise/sunset lerp windows.** `ColorSwitcher.UpdatePostProcess()` early-returns at a
  stable day/night. So writing source fields does nothing at a stable time — write **directly into
  the live `colorGrading` params each frame** instead (reconstruct vanilla night→day base + your
  boost × dayWeight). Our LateUpdate runs after ColorSwitcher.Update, so direct writes win. (2026-06-13)
- ⚠️ **Color grading param caveat:** during the transition window the game rewrites grading every
  frame; a throttled (12.5 Hz) re-clobber lets game frames bleed through → **dawn/dusk flicker**. Fix:
  run the driver every frame while `0 < NightBlend < 1`. (2026-06-13)
- 🧭 **PPv2 `overrideState`:** the post-process blend ignores any `ParameterOverride` whose
  `overrideState` is false, regardless of `.value`. If a PP param edit does nothing, check/set
  `overrideState`. (Grading params here already override true; AutoExposure overrides true but the
  whole effect is still inert — see above.) (2026-06-13)
- ✅ **Real-time point/spot Lights render fine** (GunfireLights: muzzle, explosion, tower searchlight,
  vehicle headlight, antenna beacon). They are the dominant night GPU cost — cull aggressively.
- ❌ **Camera-distance 3D cull is wrong for the RTS rig.** Camera sits at `Y = Zoom` (up to
  `minY+450` high), so straight-line distance to a ground tower is dominated by camera HEIGHT → a
  130 m budget culled on-screen lights. Use a **viewport (off-screen) test** instead; keep distance
  only as an XZ-plane backstop. (GunfireLights 1.2.1, 2026-06-13)
- ⚠️ **Live config edits in general:** subscribe `Config.SettingChanged` to force an immediate apply;
  otherwise edits wait for your throttle. And remember **time-gated params** (day-weighted) correctly
  do nothing at the wrong time of day — not a bug.

## Performance

- 🧭 **Game is CPU / main-thread bound** (RTX 4090 idle, ~35–65 FPS ceiling). GC ruled out (Burst +
  native collections). Hot paths already use Burst jobs; allocation/GC tuning is a non-issue.
- ✅ **Mod-side wins are render-side + main-thread dispatch throttles**, not GPU quality:
  - Real-time light count (GunfireLights one-light-per-tower + viewport cull ≈ 2× night FPS).
  - A* graph-update throttle (PerfPack: `GraphsUpdatesQueue` applies up to 10 navmesh updates/frame on
    the main thread; clamp to ~2 to spread build/demolish bursts).
- ❌ **External GPU levers exhausted:** D3D11-only build (`-force-d3d12` / `-force-vulkan` fail to
  launch). HAGS already on. `boot.config gfx-threading-mode=6` is the game's default (also present in
  the Map Editor build — not ours).
- 🧭 **"Do more per frame" makes spikes BIGGER.** For hitches, lower per-frame caps to spread work.

## Engine systems

- 🧭 **"Hideout" == "Lair" — one system, keyed by `Fraction`.** `HideoutsController.HideoutCleared`
  (`Action<Hideout>`) fires for bandit camps AND swarm nests. `HideoutsController.Hideouts` enumerates
  them. Reach the controller via `EventsSystemController.HideoutsController`, or patch the
  `HideoutsController` constructor. `Hideout`: `Id`, `Position`, `Fraction`, `PatrollingGroups`,
  `TryCreateGroupFromMainGroup(out Group)`. (RaiderEscalation)
- ✅ **Cheap off-screen density = `VirtualGroup` / `VirtualGroupsController`.** `VirtualGroup` is a
  lightweight `IGroup` (`Show()`, `OnBecomeVisible/Invisible`); `VirtualGroupsController.Create(draft,
  size[, weapon])` makes them. The engine already represents distant/off-screen swarms virtually and
  materializes near the player — so "surrounded by thousands" is feasible WITHOUT thousands of active
  sim units (the game is main-thread bound at ~350 active groups). This is the lever for any
  large-horde / "Surrounded" (They-Are-Billions-style) mode. (2026-06-13)
- 🧭 **Second, unrelated "lair":** `Building : ILair` + `MarkedAsLairCount` is an AI-targeting flag
  (infected nesting in a building), not the clear/reward structure. Don't conflate.
- 🧭 **Fractions:** `Player`, `Infected` (swarms), `Bandits`, `Bandits_ransom`, `Army`, `Immigrants`.
  Hostility is data-driven (`group.EnemiesProvider.IsEnemy` → `AffiliationProvider.Get(fraction) ==
  Affiliation.Hostile`). Bandits ↔ Infected are mutually hostile in vanilla.
- 🧭 **Bandit AI is reactive + leashed** (patrol camp, chase to a release distance, return). Nothing
  vanilla makes raiders march on the player — `Hideout` exposes `IsOutOfReturnDistance` /
  `IsOutOfReleaseDistance`. A forced raid (MoveOrder at HQ) is leash-limited.
- 🧭 **Give a Group an order:** `group.OrdersHandlers.GiveOrder(new MoveOrder(pos, true, null), true)`.
  `OrdersQueue.GiveOrder(Order, bool)` is the underlying call. `AttackGroupOrder(Group)` /
  `AttackOrder(IGroup)` target groups. (All `AttackGroupOrder` issuers in vanilla are player-side.)
- 🧭 **Grant resources to the player stockroom:**
  `StockroomsController.Container.ForceAddResource(ResourceID, qty, ResourceAddReason.None)`.
  ResourceIDs: `res_ammo, res_metal, res_food_rations, res_fuel, eq_assault_rifle, …`.
- 🧭 **Day counter:** `TimeController.Day` (static int). Hour: `TimeController.Hour`; sunrise/sunset:
  `SunriseHour` / `SunsetHour`.
- 🧭 **Combat gate:** `group.EnemiesProvider?.HaveEnemyInViewRange()` (used by SquadMerge SkipInCombat).
- ⚠️ **Beta API churn:** `StructureAttackPerformer.LastAttackedGroup` was removed in 0.26.6 — read
  volatile beta members via reflection with a graceful fallback so one DLL works on beta + stable.
- ⚠️ **Old-save crash:** `WorkBase.CanExecute()` NREs in `ProductionData.GetProfitPairs()` on
  incomplete production drafts (older saves via SaveUnlock). Guard all `CanExecute()` call sites.
- ✅ **GetMaxGroupCount** vehicle cap: inside a vehicle, report the hard vehicle capacity
  (`4 + floor(cargoSlots/4)`), never inflate to member count, or you get the "clown car" overfill.

## Nexus publishing

- 🧭 **Official v3 API uploads FILES only, cannot create PAGES.** Page creation = web form. Once a
  page exists, put its numeric id in `tools/nexus-publish/mods.json` and use `nexus-upload.mjs`.
- 🧭 **Version bump:** `node nexus-upload.mjs update <version> <ModKey...>` (archives old file).
  Key in gitignored `.env.local` (`NEXUS_API_KEY`). Mod ids: see `tools/nexus-publish/CHEATSHEET.md`
  (e.g. DarkerNights=27, GunfireLights=30, SquadMerge=40, VehicleSquadSize=41, IFZModAPI=42).
- 🧭 **Internal page-details API** (`next.nexusmods.com/api/flamework/mods/save`, session-cookie auth,
  in-page `fetch` to pass Cloudflare): sets name/summary/BBCode/tags. `categoryId=2` (Miscellaneous,
  only IFZ option). Tags shape `tags:[{id,selected:true}]` + `classtags:[id]`.

## Deploy workflow

- 🧭 Build: `dotnet build <Mod>/<Mod>.csproj -c Release`. Output DLL:
  `<Mod>/bin/Release/netstandard2.1/<Mod>.dll`.
- 🧭 Deploy = copy DLL to `X:\…\BepInEx\plugins\` (locked while game runs) + mirror to
  `C:\tmp\IFZMods\plugins\` (repo). The game-close **watcher** (background bash loop polling
  `tasklist | grep "Infection Free Zone.exe"`) auto-deploys on exit. Hash-verify after copy.
- 🧭 BepInEx log: `X:\…\BepInEx\LogOutput.log` (overwritten each launch). Player.log (Unity):
  `%USERPROFILE%\AppData\LocalLow\JutsuGames\Infection Free Zone\Player.log`.
- ⚠️ **Crash-at-launch that doesn't rewrite the BepInEx log = pre-BepInEx / native.** Seen: a
  `GfxDevice: creating device client` crash caused by **Lossless Scaling + DWM** crashing together
  (D3D present-path injectors). Not a mod. RTSS/RTSSHooksLoader also inject — reboot clears wedged
  present pipeline.

## IFZ Mods (status)

| Mod | Notes |
|-----|-------|
| DarkerNights | Night brightness = `NightSunFactor` (live, real light). `ExposureEV` inert here. |
| GunfireLights | Real-time lights; viewport cull (not 3D distance); one-light-per-tower. |
| RaiderEscalation | Dynamic Hideout strength loop; loot-on-clear both fractions; raiders-only escalation/raids. |
| SquadMerge | Right-click own squad = merge; SkipInCombat. |
| VehicleSquadSize | Capacity `4+floor(cargo/4)`; hard vehicle cap (no clown car); panel scroll reset. |
| PerfPack | A* graph-update throttle. |
| IFZModAPI | Shared controller cache (`Cache.Buildings/Groups/Squads/Stockrooms/…`), loads first. |
