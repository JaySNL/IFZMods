# IFZMods

BepInEx mod pack for **Infection Free Zone**.

15 mods + ConfigurationManager. All pure-managed `netstandard2.1` — runs on Windows, macOS (Crossover/Wine), Steam Deck / Linux (Proton).

---

## TL;DR

1. Clone this repo.
2. Run the installer for your platform.
3. Launch the game.
4. Press **F1** in-game to configure mods.

```bash
# Windows (PowerShell)
git clone https://github.com/JaySNL/IFZMods.git
cd IFZMods
.\install.ps1

# macOS / Linux / Steam Deck
git clone https://github.com/JaySNL/IFZMods.git
cd IFZMods
chmod +x install.sh && ./install.sh
```

---

## What it does

The installer:
1. Locates your **Infection Free Zone** Steam install (or asks).
2. Downloads **BepInEx 5.4.23.2** (Windows x64 build — the game is Windows-binary even on Mac/Deck).
3. Drops `winhttp.dll`, `BepInEx/` core, and all mod DLLs into the game folder.
4. Prints the launch options you need on macOS / Steam Deck.

Re-run any time to upgrade — it's idempotent.

---

## Steam Deck / Linux / macOS (Proton/Wine)

The game runs under Proton (Deck/Linux) or Crossover (macOS). BepInEx needs one extra DLL override:

**Steam Deck / Steam-on-Linux:** in Steam, right-click *Infection Free Zone* → Properties → Launch Options, paste:

```
WINEDLLOVERRIDES="winhttp=n,b" %command%
```

**macOS Crossover:** add the same `winhttp=n,b` override in the bottle's *Wine Configuration → Libraries* tab.

Without this, Proton/Wine loads its own `winhttp.dll` instead of BepInEx's loader → mods silently don't load.

---

## Mods included

| Mod | What it does |
|---|---|
| **ArmyBackup** | Fixes "Request Backup" tanks — they now actively engage hostiles near your base instead of idling. |
| **CinematicFX** | Burning structures, buffed blood/tracers, demolish dust, impact craters, night thunderstorms. |
| **ConstructionETA** | Shows time-remaining on build / repair / deconstruct panels. |
| **DarkerNights** | Actually dark nights. Full-moon brightness bonus. Smooth dawn/dusk transitions. |
| **DeconstructCancel** | Cancel paused deconstruction tasks (game won't normally let you). |
| **ExplosivesUnlock** | Unlocks explosives crafting earlier. |
| **GunfireLights** | Real-time point lights for muzzle flashes, explosions, vehicle headlights, tower searchlights, antenna aviation beacons. |
| **HousePower** | Powered homes get a separate `+mood` bonus; chimneys emit smoke. |
| **HouseRebalance** | Citizens auto-migrate to higher-priority housing when capacity exists — no more "want better housing" complaints with empty mansions. |
| **IFZQualityOfLife** | Misc QoL toggles. |
| **LocaleFix** | Forces InvariantCulture so ConfigurationManager can edit `.` decimal floats on comma-locale systems (nl-NL, de-DE, fr-FR, etc.). |
| **PerfPack** | Billboard / blood-decay throttle, AI building cache. Helps lategame. |
| **SaveUnlock** | Bypasses the "Unsupported save file" version check. Loads older saves on newer game builds. Schema-breaking saves may still fail mid-load — back up first. |
| **SmartWorkerRedist** | Smarter worker redistribution. |
| **SplitUnlock** | Bypasses "Building parts contain too narrow or too complex elements" on splits. Lets you cut up castles, cathedrals, and other irregular generated shapes. |
| **SquadAutoBehavior** | Auto-return squads to HQ at low ammo, auto-resupply, auto-hospital when wounded. |
| **SquadMerge** | Shift + right-click squad → merge into target squad. |
| **VehicleSquadSize** | Vehicle squads carry their actual seat count. |
| **ConfigurationManager** | Press **F1** in-game → tweak every mod's config live. |

---

## Configuration

All mods are tunable. Two ways:

1. **In-game (recommended):** press `F1`, find the mod, tweak.
2. **Files:** edit `<game>/BepInEx/config/<mod-guid>.cfg` (auto-generated on first launch).

---

## Uninstall

Delete `winhttp.dll` and the `BepInEx/` folder from the game install dir. Done. Game runs vanilla again.

---

## Troubleshooting

- **Mods don't load on Steam Deck / Linux / macOS** → missing `WINEDLLOVERRIDES="winhttp=n,b" %command%` launch option.
- **No `BepInEx/LogOutput.log`** → BepInEx never loaded. On Windows, check `winhttp.dll` exists next to `Infection Free Zone.exe`. On Proton/Wine, confirm the override.
- **Game crash on launch** → delete `BepInEx/plugins/*.dll`, launch vanilla, add mods back one at a time to isolate.
- **F1 does nothing** → `ConfigurationManager.dll` missing from `BepInEx/plugins/ConfigurationManager/`.

---

## Build from source

Mods aren't in this repo (DLLs only). Source lives at `C:\Users\Jooshua\Projects\IFZ-Modding`. Each mod is a `dotnet build -c Release` netstandard2.1 project.

---

## Compatibility

- IFZ build: **Unity 6000.0.26** (Early Access, 2026)
- BepInEx: **5.4.23.2** (Mono backend)
- License: MIT
