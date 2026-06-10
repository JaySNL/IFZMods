# IFZMods Nexus copy-paste cheat sheet

One section per mod. Open https://www.nexusmods.com/infectionfreezone/users/myaccount?tab=mods, click **Add a file**, then paste each block in order.

Game and Category are preset (Infection Free Zone / Miscellaneous). After Create draft → land on edit page → paste long-description sections + click tags + upload DLL + click Publish.

**After each mod is created, paste its numeric mod ID into `tools/nexus-publish/mods.json`** under that mod's `nexusModId` field. That powers the GitHub Action for future file-update releases.

---

## ArmyBackup → Army Backup AI Fix

### 1. Modal — Mod Name
```
Army Backup AI Fix
```

### 2. Modal — Short description
```
Request Backup Army tanks actually engage hostiles near your base instead of idling.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Bug Fixes**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\ArmyBackup.dll
```

### 6. Full description — Description section
```
Fixes the broken "Request Backup" AI. Vanilla Army backup tanks spawn and sit. With this mod, every 4 seconds (configurable) the mod walks all Army groups, finds the nearest Infected or Bandit threat inside the player base radius, and issues an AttackGroupOrder via the game's own OrdersHandlers.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Auto-engage hostiles near player base
- Hysteresis (ReassignDistance) prevents target dithering
- Separate toggles for Infected vs Bandits
- Configurable engagement range, tick rate, base defence radius
- F1 ConfigurationManager support, master Enabled toggle
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"ArmyBackup"` → `nexusModId`.

---

## CinematicFX → Cinematic FX

### 1. Modal — Mod Name
```
Cinematic FX
```

### 2. Modal — Short description
```
Burning structures, buffed blood and tracers, demolish dust, impact craters, night thunderstorms.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\CinematicFX.dll
```

### 6. Full description — Description section
```
Visual polish pass: burning structures, buffed blood and tracers, demolish dust, impact craters, night thunderstorms. Five independent subsystems, each individually toggleable.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Burning Structures: smoke from damaged buildings below HP threshold
- Buffed Blood: scales splash particle size and emission
- Buffed Tracers: wider tracer LineRenderer
- Demolish Dust: dust burst on deconstruct completion
- Impact Craters: smoke puff on explosion sites
- Night Storms: thunder rolls after configurable game day
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"CinematicFX"` → `nexusModId`.

---

## ConstructionETA → Construction ETA

### 1. Modal — Mod Name
```
Construction ETA
```

### 2. Modal — Short description
```
Shows time-remaining on build, repair, and deconstruct panels.
```

### 3. After Create draft → Tags (click in this order)
- **User Interface**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\ConstructionETA.dll
```

### 6. Full description — Description section
```
Adds an estimated time-to-completion label to every active construction, repair, and deconstruction work panel. Reads the same work-progress fields the game uses internally. Zero balance change, pure UI overlay.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- ETA on Build / Repair / Deconstruct panels
- Pulls live from the game's own progress data
- Useful for planning when crews free up
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"ConstructionETA"` → `nexusModId`.

---

## DarkerNights → Darker Nights

### 1. Modal — Mod Name
```
Darker Nights
```

### 2. Modal — Short description
```
Actually-dark nights, full-moon brightness bonus, smooth dawn/dusk, day tone-shaping.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\DarkerNights.dll
```

### 6. Full description — Description section
```
Owns the day/night lighting curve. Patches the game's ColorSwitcher source fields (saturation_Day_PP, contrast_Day_PP, blue_Day_PP) so the per-tick lerp uses our values as the basis — outputs don't get clobbered by the game.

Nights are actually dark. Days don't feel flat. Transitions are smooth.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Configurable night sun-intensity factor (0 = pitch black, 1 = vanilla)
- Forced night ambient colour + intensity + AutoExposure clamp
- Full-moon nights apply a brightness multiplier
- Day tone-shaping: saturation / contrast / warmth / post-exposure
- Smooth dawn/dusk via configurable TransitionHours
- Pairs with GunfireLights for synchronised tower-light fade-in
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"DarkerNights"` → `nexusModId`.

---

## DeconstructCancel → Cancel Paused Deconstruction

### 1. Modal — Mod Name
```
Cancel Paused Deconstruction
```

### 2. Modal — Short description
```
Cancel paused deconstruction tasks — vanilla blocks the delete button on partial demolitions.
```

### 3. After Create draft → Tags (click in this order)
- **User Interface**
- **Quality of Life**
- **Bug Fixes**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\DeconstructCancel.dll
```

### 6. Full description — Description section
```
Vanilla hides the delete button on deconstructions once they're paused (partial demolition), so you can't cancel them. This mod keeps the button visible and forces a clean delete on click — state machine reverts to pre-deconstruct, work entry is cleared, structure remains intact.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Delete button stays visible on paused deconstructions
- Forces clean delete (state machine reverts, work entry cleared)
- No leftover state on the structure
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"DeconstructCancel"` → `nexusModId`.

---

## ExplosivesUnlock → Explosives Planting Unlock

### 1. Modal — Mod Name
```
Explosives Planting Unlock
```

### 2. Modal — Short description
```
Force-unlocks explosives_planting so the open-beta demolition feature actually works.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Bug Fixes**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\ExplosivesUnlock.dll
```

### 6. Full description — Description section
```
The IFZ open beta exposes explosives planting in the UI but the content flag is locked, so the planting action no-ops. This mod unlocks the explosives_planting content flag after the game's ContentStateController validates missing content.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Single Harmony postfix, zero side effects
- Unlocks explosives planting in current and new saves
- No balance change otherwise
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"ExplosivesUnlock"` → `nexusModId`.

---

## GunfireLights → Gunfire Lights

### 1. Modal — Mod Name
```
Gunfire Lights
```

### 2. Modal — Short description
```
Real-time point lights for muzzle flashes, explosions, headlights, tower searchlights, antenna beacons.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\GunfireLights.dll
```

### 6. Full description — Description section
```
Real-time dynamic lighting for combat and infrastructure. Muzzle flashes on every gun, explosion flashes, vehicle headlights at night, tower searchlights that sweep and lock on, red/green aviation beacons on antenna towers.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Muzzle flashes: pooled point light per gun, warmer for heavy / shotgun
- Explosions: orange flash with configurable range
- Vehicle headlights: forward spot light on moving vehicles at night
- Tower searchlights: slow-sweeping spot, holds on last-attacked target
- Antenna beacons: real-world FAA-style red/green blinking, 24/7 or night-only
- Smooth fade-in/out around sunrise / sunset via TransitionHours
- 32-light pool, no shadow casting (cheap)
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"GunfireLights"` → `nexusModId`.

---

## HousePower → House Power

### 1. Modal — Mod Name
```
House Power
```

### 2. Modal — Short description
```
Powered homes get a +mood bonus, chimneys emit smoke, entrance lights at night.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\HousePower.dll
```

### 6. Full description — Description section
```
Powered homes get a separate +mood bonus, chimneys emit smoke, entrance lights glow at night. Residential buildings auto-install a generator that burns wood on a configurable tick. While powered, residents are happier and the house actually looks lived-in.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- +mood bonus shown in the mood panel, scales with fraction of residents in powered homes
- Chimney smoke on powered houses (or roof centre fallback, skips high-rises without chimneys)
- Entrance / window lights on at night, dimmer during day
- Throttled to 2 Hz across hundreds of buildings for low perf cost
- Tunable wood-per-tick and tick interval
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"HousePower"` → `nexusModId`.

---

## HouseRebalance → House Rebalance

### 1. Modal — Mod Name
```
House Rebalance
```

### 2. Modal — Short description
```
Citizens auto-migrate to higher-priority housing when capacity exists.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\HouseRebalance.dll
```

### 6. Full description — Description section
```
Vanilla citizens stay assigned to whatever house they got first. With this mod, every TickSeconds (default 30) each citizen re-evaluates housing using the game's own FindBestHouse ranking and migrates to a better house if slots exist.

Result: no more "want better housing" mood penalty while empty mansions sit unused.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Periodic citizen re-housing sweep
- Uses the game's native FindBestHouse priority
- Eliminates "want better housing" complaints with empty premium housing
- Tick interval tunable in F1
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"HouseRebalance"` → `nexusModId`.

---

## IFZQualityOfLife → IFZ Quality of Life Bundle

### 1. Modal — Mod Name
```
IFZ Quality of Life Bundle
```

### 2. Modal — Short description
```
TowerHMG + VehicleAmmoFix + HeightAdvantage. Three small QoL patches in one DLL.
```

### 3. After Create draft → Tags (click in this order)
- **Quality of Life**
- **Bug Fixes**
- **Gameplay**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\IFZQualityOfLife.dll
```

### 6. Full description — Description section
```
Three small QoL patches bundled in one DLL: TowerHMG, VehicleAmmoFix, HeightAdvantage.

Each feature is individually toggleable in F1 ConfigurationManager.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- TowerHMG: defensive towers accept Heavy MGs (eq_hcal) after carworkshop_hcal research
- VehicleAmmoFix: vehicles auto-refill ammo from their own trunk cargo when stockroom path fails
- HeightAdvantage: squads in tall buildings get fight-range bonus based on building height
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"IFZQualityOfLife"` → `nexusModId`.

---

## LocaleFix → Locale Fix (ConfigurationManager floats)

### 1. Modal — Mod Name
```
Locale Fix (ConfigurationManager floats)
```

### 2. Modal — Short description
```
Forces InvariantCulture so ConfigurationManager can edit decimal floats on comma-locale systems.
```

### 3. After Create draft → Tags (click in this order)
- **Bug Fixes**
- **Utilities for Players**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\LocaleFix.dll
```

### 6. Full description — Description section
```
Required on comma-decimal Windows locales (nl-NL, de-DE, fr-FR, etc.) where editing float fields in BepInEx ConfigurationManager throws FormatException ("Input string was not in a correct format").

Forces CultureInfo.InvariantCulture on the main thread + DefaultThreadCurrentCulture. A Sentinel MonoBehaviour re-pins every frame in case Unity / game subsystems reset it on scene loads.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- One-time culture pin on Awake
- Per-frame Sentinel re-pin (cheap branch + pointer compare)
- Fixes float-parse FormatException in ConfigurationManager UI
- Caveat: the Awake-time pin applies once at process start regardless of toggle
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"LocaleFix"` → `nexusModId`.

---

## PerfPack → Performance Pack

### 1. Modal — Mod Name
```
Performance Pack
```

### 2. Modal — Short description
```
Billboard / blood-decay throttle and opt-in AI building cache. Helps lategame frame rate.
```

### 3. After Create draft → Tags (click in this order)
- **Performance Optimization**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\PerfPack.dll
```

### 6. Full description — Description section
```
Three perf throttles for lategame: billboard refresh, blood-decay writes, and an optional AI building cache. Safe defaults — no rendering or logic regressions.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Billboard throttle: refreshes each billboard every Nth frame, staggered (default N=3)
- Blood decay throttle: clamps SetBloodPuddleValue writes to once every IntervalSec per body
- AI building cache (opt-in, OFF by default): caches FindHealingSpot result per AI for N seconds
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"PerfPack"` → `nexusModId`.

---

## SaveUnlock → Save File Version Unlock

### 1. Modal — Mod Name
```
Save File Version Unlock
```

### 2. Modal — Short description
```
Bypasses the Unsupported save file version check. Load older saves on newer game builds.
```

### 3. After Create draft → Tags (click in this order)
- **Utilities for Players**
- **Bug Fixes**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\SaveUnlock.dll
```

### 6. Full description — Description section
```
Bypasses the "Unsupported save file version" gate. Loads older saves on newer game builds. Patches VersionValidator.ValidatePlayedVersions and ValidateMinPlayableVersion to always return true.

Caveat: schema-breaking saves may still fail mid-load. Back up your save before trying.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Two-line Harmony patch, no behaviour change beyond the gate
- Works across beta version bumps
- Master Enabled toggle in F1 if you want vanilla checks back
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"SaveUnlock"` → `nexusModId`.

---

## SmartWorkerRedist → Smart Worker Redistribution

### 1. Modal — Mod Name
```
Smart Worker Redistribution
```

### 2. Modal — Short description
```
Stalled construction sites auto-pull workers from idle jobs.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\SmartWorkerRedist.dll
```

### 6. Full description — Description section
```
When construction stalls because resources are missing but workers are still parked there, this mod frees them. Every TickSeconds (default 20) it counts vacancies on unsuspended works that can execute, then frees an equal number of workers from suspended works — WorkController auto-reassigns them to live jobs.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Periodic redistribution sweep
- Frees idle workers from stalled construction
- Live jobs pick them up via vanilla WorkController paths
- Tunable verbosity for debugging
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"SmartWorkerRedist"` → `nexusModId`.

---

## SplitUnlock → Split Unlock (castles, cathedrals)

### 1. Modal — Mod Name
```
Split Unlock (castles, cathedrals)
```

### 2. Modal — Short description
```
Bypasses "Building parts contain too narrow or too complex elements" on building splits.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\SplitUnlock.dll
```

### 6. Full description — Description section
```
Bypasses "Building parts contain too narrow or too complex elements" on building splits. Lets you cut up castles, cathedrals, and irregular generated shapes that the vanilla split validator rejects.

Caveat: splits along genuinely degenerate geometry may produce ugly or partially-walkable parts. The mod doesn't make those splits better — it lets them happen.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Two independent toggles: AllowWrongDimensions (narrow/complex check) and AllowSmallSurface (size check)
- Both default on
- Toggle each independently in F1 ConfigurationManager
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"SplitUnlock"` → `nexusModId`.

---

## SquadAutoBehavior → Squad Auto Behavior

### 1. Modal — Mod Name
```
Squad Auto Behavior
```

### 2. Modal — Short description
```
Auto-medbay when wounded, auto-resupply ammo, auto-return-to-HQ when ammo runs dry.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\SquadAutoBehavior.dll
```

### 6. Full description — Description section
```
Reduces babysitting. Every TickSeconds (default 8) the mod sweeps player squads and issues smart orders: wounded squads go to medbay, indoor squads grab ammo from stockrooms, dry squads return to HQ.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Auto-medbay when wounded near HQ
- Auto-resupply ammo from stockroom indoors
- Auto-return-to-HQ when ammo runs dry
- Daylight-only by default (configurable)
- Per-squad cooldowns prevent order spam
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"SquadAutoBehavior"` → `nexusModId`.

---

## SquadMerge → Squad Merge (right-click)

### 1. Modal — Mod Name
```
Squad Merge (right-click)
```

### 2. Modal — Short description
```
Right-click your own squad with another selected → merge into target squad.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\SquadMerge.dll
```

### 6. Full description — Description section
```
Right-click your own squad while another is selected to merge them. Vanilla would have issued a follow order. Soft-caps merged squad size to configurable max (default 8 — above vanilla 4).

Note: vehicle merges are handled by VehicleSquadSize, not this mod.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Right-click squad-to-squad merge for own faction
- Configurable soft-cap (default 8)
- Long-distance follow-then-merge inside MergeRange (default 10m)
- RequireShift toggle exists but is off by default (vanilla hijacks Shift before the click)
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"SquadMerge"` → `nexusModId`.

---

## VehicleSquadSize → Vehicle Squad Size

### 1. Modal — Mod Name
```
Vehicle Squad Size
```

### 2. Modal — Short description
```
Vehicle capacity scales with cargo slots: 4 + floor(cargoSlots/4). Pickup 5, Van 6, Truck 8, Bus 9.
```

### 3. After Create draft → Tags (click in this order)
- **Gameplay**
- **Quality of Life**

### 4. Edit page — Version
```
1.0.0
```

### 5. Edit page — Upload file
```
C:\tmp\IFZMods\plugins\VehicleSquadSize.dll
```

### 6. Full description — Description section
```
Vehicles carry their actual seat count instead of vanilla's flat 4. Formula: 4 + floor(cargoSlots / 4). Result: Pickup 5, Van 6, Truck 8, Bus 9.

Includes merge-into-vehicle, split-on-exit, and a UI patch so the seat counter shows members / vehicleCap.
```

### 7. Full description — Installation instructions
```
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.
```

### 8. Full description — Main features
```
- Vehicle capacity scales with cargo slots
- Right-click vehicle with squad selected = merge members into vehicle
- Long-distance: follow first, auto-merge inside 10m
- Split on exit: merged passengers become their own functional squad with unique name
- UI shows members / vehicleCap while in vehicle
- Save / reload tested
```

### 9. Full description — Requirements
```
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26 / beta 0.26.5.29+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended:
- BepInEx ConfigurationManager (press F1 in-game to tweak this mod live)
- LocaleFix (required if your Windows locale uses comma decimals — nl-NL, de-DE, fr-FR, etc.)
```

### 10. Full description — Shout outs
```
Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

### After publishing
Record the resulting mod ID (number in the URL) in `mods.json` under `"VehicleSquadSize"` → `nexusModId`.

---

