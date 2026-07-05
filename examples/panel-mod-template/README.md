# Panel Mod — IFZModPanels starter template

A minimal, copy-paste starting point for building an in-game UI panel with the
**IFZModPanels** library (Nexus mod 77). It registers one window (toggle key `F7`)
with a section, a live value, and a progress bar.

## Use it
1. Copy this folder somewhere in your own mod workspace and rename it.
2. Rename `PanelMod.csproj` and change the `GUID` / plugin name / version in `Plugin.cs`,
   plus the `Panels.Register` id.
3. Point the csproj `HintPath`s at your game install (they resolve against `$(GameDir)`),
   and build against a copy of `IFZModPanels.dll` (ships in `plugins/` in this repo, or
   install the library from Nexus).
4. Drop your built DLL **and** `IFZModPanels.dll` into `<game>/BepInEx/plugins/`.

## Requirements
- BepInEx 5.4.x
- `IFZModPanels.dll` in `BepInEx/plugins/` (the library loads first; declare
  `[BepInDependency("ifz.modpanels")]`).

The full API surface (sections, values, bars, buttons, toggles, sliders, the `Every(...)`
tick loop, and the raw-uGUI `Body` escape hatch) is documented alongside the library.
This template is intentionally tiny — start here and grow it.
