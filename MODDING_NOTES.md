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
- 🧭 **`VirtualGroup` / `VirtualGroupsController` = the engine's off-screen density.** `VirtualGroup` is a
  lightweight `IGroup`; `VirtualGroupsController.Create(draft, size[, weapon])` makes them, `.Groups`
  lists them. The engine stages distant swarms virtually (observed ~70 staged) and materializes them
  near the player. A free (non-swarm) VirtualGroup converts to a real `Group` via `TryConvertingGroup()`
  ONLY when it enters `Map.RawBound.Expand(30)` at night (or inside an enterable). (2026-06-13)
- ⛔ **DO NOT hand-spawn infected via `VirtualGroupsController.Create` for a custom horde.** The
  free Create→Convert path produces engine-INVALID groups: `LairFinder._weatherController` is a Zenject
  `[Inject]` field that is NOT populated, so `LairFinder.TimeToHide()` NREs **every frame** on every such
  group (`Group.CustomUpdate → LairFinder.CustomUpdate`, `LairFinder.cs:134`) → game crash. The free path
  also misses draft init, save-restore (saved swarms reload via `Get`/`Load`, never `Create`), and racing
  the async load crashes hideout reconstruction (`Hideout.OnEnterableGroupEnter` NRE). Four distinct
  landmines — abandon this approach. (Surrounded 0.1.x, 2026-06-14)
- ✅ **Correct "Surrounded" / large-horde lever = steer the game's OWN swarm system via difficulty
  getters** (no hand-spawning, crash-proof — just override floats the spawner already reads):
  • `GameCustomize.SwarmsIntensity` — `EventsSystemController:1271` `hourToAdd *= SwarmsIntensity`, so
    SMALLER = more frequent. Patch `get_SwarmsIntensity` postfix, divide `__result`.
  • `GameCustomize.HordeSizeMultiplier` — `:1389` scales group size, `:1261` shortens delays. HIGHER =
    bigger + more frequent. Patch `get_HordeSizeMultiplier` postfix, multiply `__result`.
  These produce fully DI-injected, correctly-targeting vanilla swarms. (`GameCustomization` namespace.)
  Confirmed in-game: a single low/high pair yields visibly huge, frequent hordes. (Surrounded 0.2.x, 2026-06-14)
- ⚠️ **Harmony `PatchAll()` is all-or-nothing — one bad target silently kills the whole mod.** An
  ambiguous overload (e.g. two `DrawResourcesForTag`) → `AmbiguousMatchException`; a Zenject class with no
  public ctor (e.g. `SwarmSpawner`) → null `TargetMethod`. Either aborts `Awake` AFTER earlier patches
  applied, and the exception goes to Unity's dead log writer = invisible. Patch each class via its own
  `harmony.CreateClassProcessor(t).Patch()` in try/catch, and create your driver unconditionally.
  Resolve ambiguous overloads with an explicit `TargetMethod()`. (Surrounded 0.1.x, 2026-06-14)
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
- ⛔ **Can't march an off-screen camp's members at the player — they're virtualized.** Unrevealed
  `Hideout`s realize only ~1 `Character` (live `MainGroup.Characters.Count` reads 1 vs serialized
  `MainGroupCurrentCapacity` 8). So `TryCreateGroupFromMainGroup` clamps to `Count-1` = 0 → fails, and
  `PatrollingGroups` is empty → nothing orderable. `Reveal()`/`MainGroup.Show()` only fires when the
  PLAYER approaches; forcing it shows the camp on the map + perf cost, and real units don't path the
  whole map anyway. **True size lives in `Hideout.MainGroupCurrentCapacity` (serialized, reveal-
  independent) — read that, not the live count.** (RaiderEscalation 1.1.4, 2026-06-14)
- ✅ **Working "raid the player" path = spawn a fresh hostile group at the HQ perimeter**, not mobilize
  the camp. `_controller.GroupBuilder.SpawnGroupAt(pos, groupDraft, size)` builds `size` fresh chars
  from a `GroupDraft`; use the camp's own `Hideout.Draft.PatrolGroupSpawnData.Draft` (Fraction.Bandits →
  hostile + red marker auto). Spawn at `hqPos + (camp−hq).normalized * ~80` (OUTSIDE the base, on the
  nest's approach vector — too small spawns INSIDE the base), then `GiveOrder(new MoveOrder(hqPos,...))`.
  Needs `Sirenix.Serialization.dll` referenced (GroupDraft : SerializedScriptableObject).
  (RaiderEscalation 1.2.x, 2026-06-14)
- ⚠️ **`SpawnGroupAt(pos, draft, size)` spawns UNARMED — blank gunless raiders, no weapon-drop on
  death.** Its `weapon` param defaults to `ResourceID.None`; `GroupBuilder.AddCharacter` only arms from
  the `_weapons` list, never from `CharacterDraft.DefaultWeapon`. Weapons live on the **`GroupSpawnData`**
  (`Hideout.Draft.PatrolGroupSpawnData` itself, NOT its `.Draft`): `RandomizeWeaponsForMembers` +
  `WeaponChances` (per-member roll, `wc.MaxChance >= Random.value`) else flat `Weapon`. Vanilla patrols
  dodge this by reusing already-equipped chars (`SetCharactersToUse`). Fix: replicate
  `GroupSpawnPoint.CreateGroup` — build via `GroupBuilder.Clear().SetWeapon(list)....Build(draft)`,
  falling back to `draft.CharacterDraft.DefaultWeapon.ResourceType` so raiders are never unarmed.
  Death resource-drops (meat/loot) are separate: keyed on `character.Draft.name` via
  `ICharacterDyingSignal` (`DropResourceOnDeathController`), fraction/group-agnostic — fire fine once the
  draft is right. (RaiderEscalation 1.2.3, 2026-06-15)
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
- 🧭 **Deconstruct a building programmatically = `Structure.StartDeconstruction()`** (protected virtual).
  Exactly what the panel's deconstruct (Y) button fires: `Building` overrides it to run
  `base.StartDeconstruction()` (`StateMachine.ChangeTo(Deconstructing)` + `DeconstructWork.StartWork()` —
  the queued AI job) plus `BuildingDestruction.StartDeconstruction()`. Resolve via plain reflection
  (`BindingFlags.Instance|NonPublic`) and `Invoke(building, null)`; workers pick the job up normally.
  (MassDeconstruct 1.0.0, 2026-06-15)
- 🧭 **Deconstruct-eligibility gate** (mirror `NewStructurePanelInfo.IsDeconstructAllowed` + the
  deconstructButton conditions): `Draft.IsDeconstructable`, `!= HqController.MainHeadquarter`,
  `!IsDeconstructing`, `!HasMarkerWithBlockedDeconstruction()`, `!IsRevealedHideout()`. **No `IsDone`/
  ownership requirement** — that's why ABANDONED buildings are deconstructable (same as the Y button).
  Add `IsAdapted() || IsClaimedByPlayer` only if you want to restrict to player-owned. (MassDeconstruct)
- ✅ **Box-select buildings the way the engine does: `Physics.OverlapBox` on the `"Building"` layer**, NOT
  a `BuildingsController.Buildings` + `WorldToScreenPoint` projection (that cache went stale/desynced).
  Buildings set `gameObject.layer = "Building"`; mirror `AreaObjectsSelector`/squad box-select: two drag
  corners → ground-plane points (`cam.ScreenPointToRay` ∩ `y=0`), build a CAMERA-oriented box
  (`rot = cam.rotation`, footprint from the drag, big vertical half-extent so height is moot),
  `Physics.OverlapBoxNonAlloc(center, half, buf, rot, BuildingMask)`, then `TryGetComponent<Building>` /
  `GetComponentInParent<Building>` (collider may be on a child). (MassDeconstruct 1.0.0, 2026-06-15)
- ⛔ **Deconstruct is NOT part of the `AreaWorkSystem`.** That drag-box framework (`AreaWorkCursor` →
  `AreaWorkObjectsSelector` → `AreaWorkController.CreateAreaWork`) only handles `IAreaWorkable` /
  `AggregatableWork` (scavenge, gather, plant-tree). `DeconstructWork` is a separate `WorkBase` hierarchy,
  so you can't register a new `AreaWorkType` for it — build your own marquee + per-building trigger. (MassDeconstruct)
- ⚠️ **Keep ALL reflection off the plugin-load path — resolve `MethodInfo` LAZILY on first use, not in
  `Awake`.** A `typeof(Structure).GetMethod(...)` at load was implicated in a chainload stall; deferring it
  behind a `bool _resolved` getter keeps `Awake` reflection-free and the BepInEx preloader never hangs on
  it. (MassDeconstruct, 2026-06-15)

## Candidate features (assessed, not built)

### "Ruined/occupied zones" — environmental storytelling POIs (community request, 2026-06-13)

Spawn walled compounds onto the map — ruined (fallen-zone storytelling) or active (bandit-held).
Optional start-tile variant = head-start base. **Verdict: LOW–MOD. Pieces exist; no new assets
needed.** Core insight: **don't generate buildings — repurpose an existing OSM building cluster**
(map is data-driven OSM, not procedural).

Confirmed seams (decompiled, 2026-06-13):
- 🧭 **Ruins are built-in.** `StructureStateType` enum has `Abandoned`, `Ruined`, `Rubble`
  (`Gameplay/Rebuilding/StateMachine/StructureStateType.cs`). State classes
  `BuildingRuinedState` / `BuildingAbandonedState` / `BuildingRubbleState`. Drive via the
  `StructureStateMachine` (`ChangeTo(StructureStateType.Ruined)`).
- 🧭 **Ruin visuals exist.** `StructureAppearance` holds `regularMesh` + `ruinMesh`.
  `BuildingMaterialChanger`: `SetRuinsHeight(0..1)` (collapse shader), `SetDemolishedMat()` →
  `RuinsMaterial`, `BrokenWindowsSetter(bool)`, `SetRoofOpacity`. `BuildingVisualsConfig` has
  `Material` / `RuinsMaterial` / `TransparentMaterial`. ❌ **No fire/burnt/scorched state** —
  collapse + abandoned-decay only; scorch = custom shader.
- 🧭 **Debris/rubble props.** `BuildingDestruction.CreateDebris(multiplier)` scatters gatherable
  `Debris` in the footprint (`BuildingDestructionConfig.debrisPer100m2OfBuilding`).
- ✅ **Walls/gates spawn standalone (not convoy-locked).**
  `WallConstructor.CreateWall(Vector3 start, Vector3 end, PlaceableObjectDraft draft, float snapRange,
  List<Wall> result, bool isGenerated)` chains segments; `isGenerated=true` = auto-placed, not
  player-built. `WallFactory.Create(prefab, pos, rot, isGenerated)`. Gates:
  `GatesController.CreateGate(PlaceableObjectDraft)` / `GateFactory.Create(prefab)`. Towers via
  factory (all implement `IWallSnap`).
- ❌ **No compound/layout template system.** No `*StructureGroup` / `*CompoundLayout`. Must
  orchestrate perimeter yourself: compute hull around the building cluster → chain `CreateWall`
  → drop gates/towers. **This is the real work** (irregular-cluster perimeter geometry).
- ❌ **Convoys are monolithic prefabs** — walls baked in, NOT a reusable layout assembler. Don't
  mine them for compound assembly.
- 🧭 **Active variant ≈ existing Hideout.** `HideoutBuilder.Build(HideoutDraft, Building)` wraps an
  existing building as a bandit camp (no walls of its own). Add generated walls around it for the
  "fortified, still-held" look. See [[Hideout == Lair]] note above.
- 🧭 **Map-gen injection seams.** Gen chain bound in `Map.GetMapGenerator()` (`MapEssentials/Map.cs`,
  `builder.BindGenerator<…>()`). `HideoutsLocationsGenerator : LateGenerator` already picks buildings
  late → mirror it for zone-cluster selection, or do it post-load on `Map.OnGenerated`. POI tagging:
  `PoiGenerator.DoGeneration` / `BuildingPoiCreator.Execute(Building, token)`.
- ⚠️ **Walls need a `PlaceableObjectDraft` + prefab ref** (pull from wall/gate controllers or drafts)
  and run inside async gen timing. Start-tile head-start (player pre-owns the compound) is the
  hardest slice — touches claim/save/init (`Structure.IsClaimedByPlayer`).

Difficulty ladder: ruined storytelling zone **LOW–MOD** · active bandit zone **LOW–MOD** · random
placement **MOD** (clustering + gen seam) · start-tile player head-start **MOD–HIGH** (claim/save).

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
| MassDeconstruct | Drag-box deconstruct: K arms, CTRL+drag → `Physics.OverlapBox` on "Building" layer → `Structure.StartDeconstruction()` each. Gate mirrors Y button (incl. abandoned). Requires IFZModAPI. |
| Surrounded | Siege mode: scales `SwarmsIntensity`+`HordeSizeMultiplier` getters (native swarms, more/bigger) + scavenge loot ×N. NOT hand-spawned (that crashes). |
| SquadMerge | Right-click own squad = merge; SkipInCombat. |
| SquadMoveFire | ⚠️ v0.1 testing. Move+fire: prefix `IdleState.CanPauseOrderToExecuteAttack`→false (needs Fire+Move-at-Will stances). Accuracy=damage mult on `CharacterFightHandler.GetDamage`: move/run/drive/swim penalties + indoor bonus + open-field swarm panic. No hit-roll in IFZ. |
| VehicleSquadSize | Capacity `4+floor(cargo/4)`; hard vehicle cap (no clown car); panel scroll reset. |
| PerfPack | A* graph-update throttle. |
| IFZModAPI | Shared controller cache (`Cache.Buildings/Groups/Squads/Stockrooms/…`), loads first. |
