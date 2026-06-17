# IFZMods

BepInEx mod pack for **Infection Free Zone**.

> See [CHANGELOG.md](CHANGELOG.md) for what's new.

> 🆕 **Never modded before? → [Read the super-easy install guide (INSTALL.md)](INSTALL.md)** — no commands, ~2 minutes.

23 mods + ConfigurationManager. All pure-managed `netstandard2.1` — runs on Windows, macOS (Crossover/Wine), Steam Deck / Linux (Proton).

---

## TL;DR

### ⭐ Easiest (Windows) — paste one line

Open **PowerShell** (Start → type `powershell` → Enter), paste this, press **Enter**:

```powershell
iex (irm 'https://raw.githubusercontent.com/JaySNL/IFZMods/main/install.ps1')
```

Then launch the game and press **F1**. It auto-detects your game, installs BepInEx + every mod, and unblocks the files. This is the most reliable method — it sidesteps the "scripts are disabled" error and download warnings. Re-run any time to update.

**Hit an error or it's blocked?** → see **[INSTALL.md → If it's blocked](INSTALL.md#if-its-blocked)** (covers execution policy + Smart App Control).

### Prefer to click? — `install.bat`

Download **[install.bat](https://github.com/JaySNL/IFZMods/raw/main/install.bat)** and double-click it (SmartScreen → *More info → Run anyway*). ⚠️ Windows 11 **Smart App Control** may block the downloaded `.bat` outright — if so, use the one-line method above.

### Manual / other platforms

```bash
# Windows (PowerShell) — if you prefer it
git clone https://github.com/JaySNL/IFZMods.git
cd IFZMods
.\install.ps1
# (or just download install.ps1 and run:  powershell -ExecutionPolicy Bypass -File install.ps1 )

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
| **000_IFZModAPI** | Shared library (loads first). Controller cache, time/night helpers, VFX + reflection utilities used by other mods. Required by ArmyBackup, SmartWorkerRedist, CinematicFX. Keep it in `plugins/`. |
| **ArmyBackup** | Fixes "Request Backup" tanks — they now actively engage hostiles near your base instead of idling. *(Requires 000_IFZModAPI.)* |
| **CinematicFX** | Buffed blood/tracers, demolish dust, impact craters, night thunderstorms. (Burning-structures smoke/fire pinned — see CHANGELOG.) *(Requires 000_IFZModAPI.)* |
| **ConstructionETA** | Shows time-remaining on build / repair / deconstruct panels. |
| **DarkerNights** | Actually dark nights, with live tuning. Night brightness is controlled by **NightSunFactor** (Lighting) — raise to brighten, lower to darken. Full-moon bonus, smooth dawn/dusk, day tone-shaping. |
| **DeconstructCancel** | Cancel paused deconstruction tasks (game won't normally let you). |
| **ExplosivesUnlock** | Unlocks explosives crafting earlier. |
| **Flares** | ⚠️ *v0.1.2 — experimental.* Mortar **illumination flares**. At night, bunker/squad mortars auto-lob a flare at dark infected clusters in range — it arcs up, airbursts, **parachutes down** (red light + thin smoke trail) and **reveals the fog-of-war** so your mortars can shell the lit horde. Flares are a **separate mod-tracked stack**, crafted from HE ammo (1 → 5) via a draggable native-styled panel. Pairs with **DarkerNights**. *(Requires 000_IFZModAPI.)* |
| **GunfireLights** | Real-time point lights for muzzle flashes, explosions, vehicle headlights, tower searchlights, antenna aviation beacons. |
| **HousePower** | Powered homes get a separate `+mood` bonus; chimneys emit smoke. |
| **HouseRebalance** | Citizens auto-migrate to higher-priority housing when capacity exists — no more "want better housing" complaints with empty mansions. |
| **IFZQualityOfLife** | Misc QoL toggles. |
| **LocaleFix** | Forces InvariantCulture so ConfigurationManager can edit `.` decimal floats on comma-locale systems (nl-NL, de-DE, fr-FR, etc.). |
| **MassDeconstruct** | Drag-box mass deconstruction. Press **K** (configurable), drag a rectangle over your base, confirm, and every qualifying building inside is queued at once — vanilla only lets you deconstruct one at a time. Mirrors the game's own deconstruct rules (skips the HQ, non-deconstructable, and already-queued buildings). *(Requires 000_IFZModAPI.)* |
| **PerfPack** | Billboard / blood-decay throttle, AI building cache, and an A\* graph-update throttle (spreads navmesh rebuilds from build/demolish bursts across frames). Helps the CPU-bound lategame. |
| **RaiderEscalation** | Raider camps that dynamically grow when ignored, weaken when you fight them off, recoup, occasionally raid your base, and drop loot when wiped. Also pays out on cleared swarm nests. Fully tunable. *(Requires 000_IFZModAPI.)* |
| **SaveUnlock** | Bypasses the "Unsupported save file" version check. Loads older saves on newer game builds. Schema-breaking saves may still fail mid-load — back up first. |
| **SmartWorkerRedist** | Smarter worker redistribution. *(Requires 000_IFZModAPI.)* |
| **SplitUnlock** | Bypasses "Building parts contain too narrow or too complex elements" on splits. Lets you cut up castles, cathedrals, and other irregular generated shapes. |
| **SquadAutoBehavior** | Auto-return squads to HQ at low ammo, auto-resupply, auto-hospital when wounded. |
| **SquadMerge** | Right-click one of *your own* squads with another selected → merges their members into one squad (soft cap 8). This is how you get a bigger squad **on foot**. Skips merging during combat by default. |
| **SquadMoveFire** | ⚠️ *v0.1.2 — testing.* Squads **fire while moving** instead of halting — **on foot and in vehicles** (needs Fire-at-Will + Move-at-Will stances). **Hold Your Ground** now *truly* anchors a squad — it fires in-range targets but won't advance to engage. Adds an "accuracy = damage" model: penalties for walking/running/driving and a **hard** penalty while swimming; confidence **bonus** firing from inside buildings, **penalty** when swarmed in the open. All tunable in F1. |
| **Surrounded** | "Surrounded" siege mode. Makes the vanilla swarm attack **more often and bigger** (`SwarmFrequencyBoost`, `HordeSizeBoost`) and multiplies **scavenge + expedition loot** (`Loot.Multiplier`) so you're pushed out to forage between assaults. Drives the game's own swarm system — no performance-killing custom spawns. *(Requires 000_IFZModAPI.)* |
| **VehicleSquadSize** | A squad gains seats **only while inside a vehicle** (capacity = `4 + floor(cargoSlots / 4)` → Pickup 5, Van 6, Truck 8, Bus 9). The extra panel slots are vehicle passenger seats — on foot the game still caps at 4, so they stay empty until you board. For a bigger **foot** squad, use **SquadMerge**. |
| **ConfigurationManager** | Press **F1** in-game → tweak every mod's config live. |

---

## Configuration

All mods are tunable. Two ways:

1. **In-game (recommended):** press `F1`, find the mod, tweak.
2. **Files:** edit `<game>/BepInEx/config/<mod-guid>.cfg` (auto-generated on first launch).

**Disabling a mod without removing the DLL:** every mod has a master `Enabled` toggle under its `General` section. Flip it to `false` in F1 to silence that mod live. Useful for A/B testing whether a specific mod is causing a glitch.

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

See [MODDING_NOTES.md](MODDING_NOTES.md) — a living tracker of what works / is broken / dead-ends in the IFZ engine (lighting, performance, engine systems, publishing). Check it before re-investigating a quirk.

---

## Compatibility

- IFZ build: **Unity 6000.0.26** (Early Access, 2026)
- BepInEx: **5.4.23.2** (Mono backend)
- License: MIT
