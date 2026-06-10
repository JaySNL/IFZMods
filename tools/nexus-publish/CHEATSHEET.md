# IFZMods Nexus copy-paste cheat sheet

One section per mod. Page exists already? Open it and paste into the matching fields.
Creating fresh? My Mods → **Add a file** → paste modal fields → Create draft → paste edit-page fields.

Game = Infection Free Zone, Category = Miscellaneous (only option IFZ exposes).

| key | Nexus id | requires |
|---|---|---|
| IFZModAPI | 42 |  |
| ArmyBackup | 24 | IFZModAPI |
| CinematicFX | 25 | IFZModAPI |
| ConstructionETA | 26 |  |
| DarkerNights | 27 |  |
| DeconstructCancel | 28 |  |
| ExplosivesUnlock | 29 |  |
| GunfireLights | 30 |  |
| HousePower | 31 |  |
| HouseRebalance | 32 |  |
| IFZQualityOfLife | 33 |  |
| LocaleFix | 34 |  |
| PerfPack | 35 |  |
| SaveUnlock | 36 |  |
| SmartWorkerRedist | 37 | IFZModAPI |
| SplitUnlock | 38 |  |
| SquadAutoBehavior | 39 |  |
| SquadMerge | 40 |  |
| VehicleSquadSize | 41 |  |

---

## IFZModAPI → IFZ Mod API  (mod 42)

**Mod Name**
```
IFZ Mod API
```

**Short description**
```
Shared library other IFZMods depend on. Controller cache, time/night helpers, VFX + reflection utilities. Install if a mod lists it as required.
```

**Tags:** `Gameplay`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\000_IFZModAPI.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Shared helper library for Infection Free Zone BepInEx mods. Loads first (filename 000_IFZModAPI.dll). Provides a cached game-controller registry (Buildings / Groups / Squads / Stockrooms / Work / ColorSwitcher / Weather / Light), time + night-blend helpers, VFX helpers (real smoke prefab clone, pooled point lights), cached reflection, and a PostProcessing FloatParameter shim.

You only need this if another mod lists it as a requirement. It does nothing on its own.
```

**Installation instructions**
```
Drop 000_IFZModAPI.dll into <game>/BepInEx/plugins/. Nothing to configure. Required by ArmyBackup, Cinematic FX, and Smart Worker Redistribution (and possibly others over time).
```

**Main features**
```
- Loads before all other IFZMods (alphabetical + BepInDependency)
- Shared controller-instance cache
- Time / sunrise / sunset / NightBlend helpers
- VFX: real Smoke prefab clone, pooled point-light flashes
- Cached reflection + FloatParameter shim
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — Windows / macOS (Crossover) / Steam Deck (Proton).
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
```

</details>

---

## ArmyBackup → Army Backup AI Fix  (mod 24)

> **Requirements tab:** add **IFZModAPI**.

**Mod Name**
```
Army Backup AI Fix
```

**Short description**
```
Request Backup Army tanks actually engage hostiles near your base instead of idling.
```

**Tags:** `Gameplay`, `Bug Fixes`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\ArmyBackup.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Fixes the broken "Request Backup" AI. Vanilla Army backup tanks spawn and sit. With this mod, every 4 seconds (configurable) the mod walks all Army groups, finds the nearest Infected or Bandit threat inside the player base radius, and issues an AttackGroupOrder via the game's own OrdersHandlers.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Auto-engage hostiles near player base
- Hysteresis (ReassignDistance) prevents target dithering
- Separate toggles for Infected vs Bandits
- Configurable engagement range, tick rate, base defence radius
- F1 ConfigurationManager support, master Enabled toggle
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## CinematicFX → Cinematic FX  (mod 25)

> **Requirements tab:** add **IFZModAPI**.

**Mod Name**
```
Cinematic FX
```

**Short description**
```
Buffed blood and tracers, demolish dust, impact craters, night thunderstorms.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\CinematicFX.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Visual polish pass: burning structures, buffed blood and tracers, demolish dust, impact craters, night thunderstorms. Five independent subsystems, each individually toggleable.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Burning Structures: smoke from damaged buildings below HP threshold
- Buffed Blood: scales splash particle size and emission
- Buffed Tracers: wider tracer LineRenderer
- Demolish Dust: dust burst on deconstruct completion
- Impact Craters: smoke puff on explosion sites
- Night Storms: thunder rolls after configurable game day
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## ConstructionETA → Construction ETA  (mod 26)

**Mod Name**
```
Construction ETA
```

**Short description**
```
Shows time-remaining on build, repair, and deconstruct panels.
```

**Tags:** `User Interface`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\ConstructionETA.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Adds an estimated time-to-completion label to every active construction, repair, and deconstruction work panel. Reads the same work-progress fields the game uses internally. Zero balance change, pure UI overlay.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- ETA on Build / Repair / Deconstruct panels
- Pulls live from the game's own progress data
- Useful for planning when crews free up
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## DarkerNights → Darker Nights  (mod 27)

**Mod Name**
```
Darker Nights
```

**Short description**
```
Actually-dark nights, full-moon brightness bonus, smooth dawn/dusk, day tone-shaping.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\DarkerNights.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Owns the day/night lighting curve. Patches the game's ColorSwitcher source fields (saturation_Day_PP, contrast_Day_PP, blue_Day_PP) so the per-tick lerp uses our values as the basis — outputs don't get clobbered by the game.

Nights are actually dark. Days don't feel flat. Transitions are smooth.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Configurable night sun-intensity factor (0 = pitch black, 1 = vanilla)
- Forced night ambient colour + intensity + AutoExposure clamp
- Full-moon nights apply a brightness multiplier
- Day tone-shaping: saturation / contrast / warmth / post-exposure
- Smooth dawn/dusk via configurable TransitionHours
- Pairs with GunfireLights for synchronised tower-light fade-in
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## DeconstructCancel → Cancel Paused Deconstruction  (mod 28)

**Mod Name**
```
Cancel Paused Deconstruction
```

**Short description**
```
Cancel paused deconstruction tasks — vanilla blocks the delete button on partial demolitions.
```

**Tags:** `User Interface`, `Quality of Life`, `Bug Fixes`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\DeconstructCancel.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Vanilla hides the delete button on deconstructions once they're paused (partial demolition), so you can't cancel them. This mod keeps the button visible and forces a clean delete on click — state machine reverts to pre-deconstruct, work entry is cleared, structure remains intact.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Delete button stays visible on paused deconstructions
- Forces clean delete (state machine reverts, work entry cleared)
- No leftover state on the structure
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## ExplosivesUnlock → Explosives Planting Unlock  (mod 29)

**Mod Name**
```
Explosives Planting Unlock
```

**Short description**
```
Force-unlocks explosives_planting so the open-beta demolition feature actually works.
```

**Tags:** `Gameplay`, `Bug Fixes`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\ExplosivesUnlock.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
The IFZ open beta exposes explosives planting in the UI but the content flag is locked, so the planting action no-ops. This mod unlocks the explosives_planting content flag after the game's ContentStateController validates missing content.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Single Harmony postfix, zero side effects
- Unlocks explosives planting in current and new saves
- No balance change otherwise
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## GunfireLights → Gunfire Lights  (mod 30)

**Mod Name**
```
Gunfire Lights
```

**Short description**
```
Real-time point lights for muzzle flashes, explosions, headlights, tower searchlights, antenna beacons.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\GunfireLights.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Real-time dynamic lighting for combat and infrastructure. Muzzle flashes on every gun, explosion flashes, vehicle headlights at night, tower searchlights that sweep and lock on, red/green aviation beacons on antenna towers.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Muzzle flashes: pooled point light per gun, warmer for heavy / shotgun
- Explosions: orange flash with configurable range
- Vehicle headlights: forward spot light on moving vehicles at night
- Tower searchlights: slow-sweeping spot, holds on last-attacked target
- Antenna beacons: real-world FAA-style red/green blinking, 24/7 or night-only
- Smooth fade-in/out around sunrise / sunset via TransitionHours
- 32-light pool, no shadow casting (cheap)
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## HousePower → House Power  (mod 31)

**Mod Name**
```
House Power
```

**Short description**
```
Powered homes get a +mood bonus, chimneys emit smoke, entrance lights at night.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\HousePower.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Powered homes get a separate +mood bonus, chimneys emit smoke, entrance lights glow at night. Residential buildings auto-install a generator that burns wood on a configurable tick. While powered, residents are happier and the house actually looks lived-in.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- +mood bonus shown in the mood panel, scales with fraction of residents in powered homes
- Chimney smoke on powered houses (or roof centre fallback, skips high-rises without chimneys)
- Entrance / window lights on at night, dimmer during day
- Throttled to 2 Hz across hundreds of buildings for low perf cost
- Tunable wood-per-tick and tick interval
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## HouseRebalance → House Rebalance  (mod 32)

**Mod Name**
```
House Rebalance
```

**Short description**
```
Citizens auto-migrate to higher-priority housing when capacity exists.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\HouseRebalance.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Vanilla citizens stay assigned to whatever house they got first. With this mod, every TickSeconds (default 30) each citizen re-evaluates housing using the game's own FindBestHouse ranking and migrates to a better house if slots exist.

Result: no more "want better housing" mood penalty while empty mansions sit unused.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Periodic citizen re-housing sweep
- Uses the game's native FindBestHouse priority
- Eliminates "want better housing" complaints with empty premium housing
- Tick interval tunable in F1
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## IFZQualityOfLife → IFZ Quality of Life Bundle  (mod 33)

**Mod Name**
```
IFZ Quality of Life Bundle
```

**Short description**
```
TowerHMG + VehicleAmmoFix + HeightAdvantage. Three small QoL patches in one DLL.
```

**Tags:** `Quality of Life`, `Bug Fixes`, `Gameplay`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\IFZQualityOfLife.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Three small QoL patches bundled in one DLL: TowerHMG, VehicleAmmoFix, HeightAdvantage.

Each feature is individually toggleable in F1 ConfigurationManager.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- TowerHMG: defensive towers accept Heavy MGs (eq_hcal) after carworkshop_hcal research
- VehicleAmmoFix: vehicles auto-refill ammo from their own trunk cargo when stockroom path fails
- HeightAdvantage: squads in tall buildings get fight-range bonus based on building height
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## LocaleFix → Locale Fix (ConfigurationManager floats)  (mod 34)

**Mod Name**
```
Locale Fix (ConfigurationManager floats)
```

**Short description**
```
Forces InvariantCulture so ConfigurationManager can edit decimal floats on comma-locale systems.
```

**Tags:** `Bug Fixes`, `Utilities for Players`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\LocaleFix.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Required on comma-decimal Windows locales (nl-NL, de-DE, fr-FR, etc.) where editing float fields in BepInEx ConfigurationManager throws FormatException ("Input string was not in a correct format").

Forces CultureInfo.InvariantCulture on the main thread + DefaultThreadCurrentCulture. A Sentinel MonoBehaviour re-pins every frame in case Unity / game subsystems reset it on scene loads.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- One-time culture pin on Awake
- Per-frame Sentinel re-pin (cheap branch + pointer compare)
- Fixes float-parse FormatException in ConfigurationManager UI
- Caveat: the Awake-time pin applies once at process start regardless of toggle
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## PerfPack → Performance Pack  (mod 35)

**Mod Name**
```
Performance Pack
```

**Short description**
```
Billboard / blood-decay throttle and opt-in AI building cache. Helps lategame frame rate.
```

**Tags:** `Performance Optimization`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\PerfPack.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Three perf throttles for lategame: billboard refresh, blood-decay writes, and an optional AI building cache. Safe defaults — no rendering or logic regressions.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Billboard throttle: refreshes each billboard every Nth frame, staggered (default N=3)
- Blood decay throttle: clamps SetBloodPuddleValue writes to once every IntervalSec per body
- AI building cache (opt-in, OFF by default): caches FindHealingSpot result per AI for N seconds
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## SaveUnlock → Save File Version Unlock  (mod 36)

**Mod Name**
```
Save File Version Unlock
```

**Short description**
```
Bypasses the Unsupported save file version check. Load older saves on newer game builds.
```

**Tags:** `Utilities for Players`, `Bug Fixes`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\SaveUnlock.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Bypasses the "Unsupported save file version" gate. Loads older saves on newer game builds. Patches VersionValidator.ValidatePlayedVersions and ValidateMinPlayableVersion to always return true.

Caveat: schema-breaking saves may still fail mid-load. Back up your save before trying.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Two-line Harmony patch, no behaviour change beyond the gate
- Works across beta version bumps
- Master Enabled toggle in F1 if you want vanilla checks back
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## SmartWorkerRedist → Smart Worker Redistribution  (mod 37)

> **Requirements tab:** add **IFZModAPI**.

**Mod Name**
```
Smart Worker Redistribution
```

**Short description**
```
Stalled construction sites auto-pull workers from idle jobs.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\SmartWorkerRedist.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
When construction stalls because resources are missing but workers are still parked there, this mod frees them. Every TickSeconds (default 20) it counts vacancies on unsuspended works that can execute, then frees an equal number of workers from suspended works — WorkController auto-reassigns them to live jobs.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Periodic redistribution sweep
- Frees idle workers from stalled construction
- Live jobs pick them up via vanilla WorkController paths
- Tunable verbosity for debugging
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## SplitUnlock → Split Unlock (castles, cathedrals)  (mod 38)

**Mod Name**
```
Split Unlock (castles, cathedrals)
```

**Short description**
```
Bypasses "Building parts contain too narrow or too complex elements" on building splits.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\SplitUnlock.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Bypasses "Building parts contain too narrow or too complex elements" on building splits. Lets you cut up castles, cathedrals, and irregular generated shapes that the vanilla split validator rejects.

Caveat: splits along genuinely degenerate geometry may produce ugly or partially-walkable parts. The mod doesn't make those splits better — it lets them happen.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Two independent toggles: AllowWrongDimensions (narrow/complex check) and AllowSmallSurface (size check)
- Both default on
- Toggle each independently in F1 ConfigurationManager
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## SquadAutoBehavior → Squad Auto Behavior  (mod 39)

**Mod Name**
```
Squad Auto Behavior
```

**Short description**
```
Auto-medbay when wounded, auto-resupply ammo, auto-return-to-HQ when ammo runs dry.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\SquadAutoBehavior.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Reduces babysitting. Every TickSeconds (default 8) the mod sweeps player squads and issues smart orders: wounded squads go to medbay, indoor squads grab ammo from stockrooms, dry squads return to HQ.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Auto-medbay when wounded near HQ
- Auto-resupply ammo from stockroom indoors
- Auto-return-to-HQ when ammo runs dry
- Daylight-only by default (configurable)
- Per-squad cooldowns prevent order spam
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## SquadMerge → Squad Merge (right-click)  (mod 40)

**Mod Name**
```
Squad Merge (right-click)
```

**Short description**
```
Right-click your own squad with another selected → merge into target squad.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\SquadMerge.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Right-click your own squad while another is selected to merge them. Vanilla would have issued a follow order. Soft-caps merged squad size to configurable max (default 8 — above vanilla 4).

Note: vehicle merges are handled by VehicleSquadSize, not this mod.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Right-click squad-to-squad merge for own faction
- Configurable soft-cap (default 8)
- Long-distance follow-then-merge inside MergeRange (default 10m)
- RequireShift toggle exists but is off by default (vanilla hijacks Shift before the click)
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

## VehicleSquadSize → Vehicle Squad Size  (mod 41)

**Mod Name**
```
Vehicle Squad Size
```

**Short description**
```
Vehicle capacity scales with cargo slots: 4 + floor(cargoSlots/4). Pickup 5, Van 6, Truck 8, Bus 9.
```

**Tags:** `Gameplay`, `Quality of Life`

**Version:** `1.0.0`  ·  **File:** `C:\tmp\IFZMods\plugins\VehicleSquadSize.dll`

<details><summary>Full description (5 sections)</summary>

**Description**
```
Vehicles carry their actual seat count instead of vanilla's flat 4. Formula: 4 + floor(cargoSlots / 4). Result: Pickup 5, Van 6, Truck 8, Bus 9.

Includes merge-into-vehicle, split-on-exit, and a UI patch so the seat counter shows members / vehicleCap.
```

**Installation instructions**
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

**Main features**
```
- Vehicle capacity scales with cargo slots
- Right-click vehicle with squad selected = merge members into vehicle
- Long-distance: follow first, auto-merge inside 10m
- Split on exit: merged passengers become their own functional squad with unique name
- UI shows members / vehicleCap while in vehicle
- Save / reload tested
```

**Requirements**
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

**Shout outs**
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

</details>

---

