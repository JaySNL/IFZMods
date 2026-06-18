# Nexus pages to create — 6 mods

These 6 mods are built, shipped to GitHub, and **staged in `mods.json`** but have **no Nexus page yet**. The Nexus v3 API cannot create pages — only the web form can. Create each page below, then paste its **numeric mod ID** (from the page URL, e.g. `…/mods/43` → `43`) back to me and I'll wire it into `mods.json` and push the DLL.

**For every page:** Game = *Infection Free Zone* · Category = **Miscellaneous** (only IFZ option) · upload the DLL from `plugins/<Mod>.dll`.

Permissions (match the rest of the pack): modify-for-bugfix ✅ · modify-for-improvement ✅ · use-assets ✅ · upload-elsewhere-with-credit ✅ · convert-to-other-game ❌.

---

## Surrounded - siege mode

- **File/key:** `Surrounded` · **Version:** `0.4.0` · **DLL:** `plugins/Surrounded.dll`
- **Tags:** Gameplay, Difficulty

**Summary (short, one line):**

> Vanilla swarms attack far more often and bigger; scavenge loot multiplied so you push out between waves.

**Description (long / page body):**

```
"Surrounded" siege mode. Day is the calm window; night is the assault.

It does NOT hand-spawn units (that produces engine-invalid groups that crash the game). Instead it steers the game's OWN swarm system — the swarms are 100% vanilla-built (correct pathing/targeting, no perf landmines), there are just a lot more of them, a lot more often.

Includes a day-1→30 ease-in ramp so a fresh base isn't run over instantly, and a read-only F1 Status panel that shows live exactly what it's changing for spawn frequency, horde size, and lair formation.

FEATURES
- Siege: vanilla swarms attack much more frequently and bigger (SwarmFrequencyBoost, HordeSizeBoost)
- Difficulty ease-in ramp (RampDays, default 30) so day 1 isn't an instant loss
- Loot pull: scavenge + expedition yield multiplied (Loot.Multiplier) so you forage between assaults
- Read-only F1 Status panel: live effective spawn-frequency / horde-size / lair-formation numbers
- Optional opt-in lair-formation lever
- Everything live-tunable in F1; master toggle if it gets too brutal

REQUIREMENTS
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Requires: 000_IFZModAPI (shared library, loads first — install it alongside this mod).
Recommended: BepInEx ConfigurationManager (press F1 in-game to tweak live).

INSTALLATION
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.

Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

---

## Hives - infected hive seeding (experimental)

- **File/key:** `Hives` · **Version:** `0.1.0` · **DLL:** `plugins/Hives.dll`
- **Tags:** Gameplay, Difficulty

**Summary (short, one line):**

> Seeds extra infected hideouts across the map on a new game; they grow into lairs. Pairs with Surrounded.

**Description (long / page body):**

```
EXPERIMENTAL (v0.1.0). On a new game, seeds N buildings scattered across the map (away from your HQ) as infected hideouts using the game's OWN hideout spawn (engine-valid, not a hand-spawn). They mature into lairs over time, breeding local pressure — more scattered objectives to push out toward.

Seeds once per save (per-save flag, never re-stacks on reload). Loading a pre-Hives save seeds it fresh with your current settings. Pairs naturally with Surrounded (waves) — Hives gives you the map full of nests between them.

FEATURES
- Seeds infected hives into buildings across the map on a new game
- Kept away from your start (MinDistanceFromHQ) so there's room to find them
- HiveCount (default 50), PlacePerTick tunable in F1
- Once per save — never re-stacks on reload
- Uses the engine's own hideout spawn (no crash-prone hand-spawns)

REQUIREMENTS
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Requires: 000_IFZModAPI (shared library, loads first — install it alongside this mod).
Recommended: BepInEx ConfigurationManager (press F1 in-game to tweak live).

INSTALLATION
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.

Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

---

## Raider Escalation

- **File/key:** `RaiderEscalation` · **Version:** `1.2.4` · **DLL:** `plugins/RaiderEscalation.dll`
- **Tags:** Gameplay, Difficulty

**Summary (short, one line):**

> Raider camps grow when ignored, weaken when fought, raid your base, and drop loot when wiped.

**Description (long / page body):**

```
Makes bandit/raider camps dynamic. Camps grow in strength when you ignore them, weaken when you fight them off, recoup over time, occasionally raid your base, and drop loot when wiped. Also pays out on cleared swarm nests.

Raiders spawn fully armed (they take the camp's own equipped weapon, with a guaranteed-armed floor). Fully tunable.

FEATURES
- Camps dynamically grow when ignored, weaken when fought, then recoup
- Camps occasionally raid your base
- Loot drops when a camp is wiped; payouts on cleared swarm nests
- Raiders spawn armed with real weapons
- Fully tunable in F1

REQUIREMENTS
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Requires: 000_IFZModAPI (shared library, loads first — install it alongside this mod).
Recommended: BepInEx ConfigurationManager (press F1 in-game to tweak live).

INSTALLATION
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.

Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

---

## Mass Deconstruct - drag-box

- **File/key:** `MassDeconstruct` · **Version:** `1.0.0` · **DLL:** `plugins/MassDeconstruct.dll`
- **Tags:** Gameplay, Quality of Life

**Summary (short, one line):**

> Press K, drag a box over your base, confirm — every qualifying building inside is queued for deconstruction at once.

**Description (long / page body):**

```
Vanilla only lets you deconstruct one building at a time. This adds drag-box mass deconstruction: press K (configurable) to arm, CTRL+drag a rectangle over your base, confirm, and every qualifying building inside is queued at once.

Mirrors the game's own deconstruct rules — skips the HQ, non-deconstructable buildings, and anything already being torn down.

FEATURES
- Hotkey to arm (default K), CTRL+drag to box-select
- Confirm dialog before queueing
- Honors the game's own deconstruct eligibility (skips HQ, non-deconstructable, already-queued)
- OwnedOnly and confirm toggles in F1

REQUIREMENTS
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Requires: 000_IFZModAPI (shared library, loads first — install it alongside this mod).
Recommended: BepInEx ConfigurationManager (press F1 in-game to tweak live).

INSTALLATION
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.

Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

---

## Squad Move and Fire (experimental)

- **File/key:** `SquadMoveFire` · **Version:** `0.1.2` · **DLL:** `plugins/SquadMoveFire.dll`
- **Tags:** Gameplay

**Summary (short, one line):**

> Squads fire while moving instead of halting — on foot and in vehicles. Hold Your Ground truly anchors.

**Description (long / page body):**

```
EXPERIMENTAL (v0.1.2). Squads fire WHILE moving instead of stopping to shoot — on foot and in vehicles (needs Fire-at-Will + Move-at-Will stances). Hold Your Ground now truly anchors a squad: it fires in-range targets but won't advance to engage.

Adds an accuracy = damage model (IFZ has no hit-roll): penalties for walking/running/driving, a hard penalty while swimming, a confidence bonus firing from inside buildings, and a penalty when swarmed in the open. All tunable in F1.

FEATURES
- Fire while moving, on foot and in vehicles
- Hold Your Ground anchors (fires but won't advance)
- Accuracy-as-damage: move/swim/drive penalties, indoor confidence bonus, open-field swarm penalty
- All multipliers tunable in F1

REQUIREMENTS
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended: BepInEx ConfigurationManager (press F1 in-game to tweak live).

INSTALLATION
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.

Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

---

## Flares - mortar illumination (experimental)

- **File/key:** `Flares` · **Version:** `0.1.3` · **DLL:** `plugins/Flares.dll`
- **Tags:** Gameplay

**Summary (short, one line):**

> At night, mortars autonomously lob illumination flares at dark infected clusters, revealing fog-of-war.

**Description (long / page body):**

```
EXPERIMENTAL (v0.1.3). At night, bunker- and squad-mounted mortars autonomously lob an illumination flare at dark infected clusters within range. It arcs up, airbursts, and parachutes down as a red light + thin smoke trail, revealing the fog-of-war beneath it so mortars can engage the lit horde.

Built as a pure driver + reflection (no Harmony). Flare stack is per-save.

FEATURES
- Mortars auto-fire illumination flares at dark infected clusters at night
- Flare airbursts and parachutes down, revealing fog-of-war
- Red light + thin smoke trail
- Per-save flare stack; tunable in F1

REQUIREMENTS
BepInEx 5.4.23.2. Infection Free Zone Unity 6000.0.26+. Pure-managed netstandard2.1 — runs on Windows / macOS (Crossover) / Steam Deck (Proton).

Recommended: BepInEx ConfigurationManager (press F1 in-game to tweak live).

INSTALLATION
Drop the DLL into <game>/BepInEx/plugins/. Launch the game. Press F1 in-game (ConfigurationManager) to tweak settings live.

Proton/Wine/Mac: add launch option WINEDLLOVERRIDES="winhttp=n,b" %command%.

Built by JayMade. Source: https://github.com/JaySNL/IFZMods.
BepInEx, Harmony, and the IFZ modding community.
```

---

## After you create them

Paste the IDs in any form, e.g.:

```
Surrounded=43 Hives=44 RaiderEscalation=45 MassDeconstruct=46 SquadMoveFire=47 Flares=48
```

I'll set each `nexusModId` in `mods.json`, then run `node nexus-upload.mjs <Key>` per mod to upload the DLL. (Still need `NEXUS_API_KEY` in `tools/nexus-publish/.env.local` for the upload step.)
