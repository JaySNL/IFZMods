# Infection Free Zone on macOS (CrossOver / Wine) — Save & New-Game Crash Fix

**TL;DR:** On macOS, IFZ under CrossOver/Wine crashes when you start a new game and refuses
to load saves (instant crash or "SAVE CORRUPTED"). The game itself is fine — three different
macOS-Wine filesystem quirks trip up Unity's bundled Mono runtime. `IFZMacFix.dll` (a tiny
BepInEx/Harmony plugin in `plugins/`) patches around all three. It **self-detects** macOS-Wine
and does **nothing on Windows or Linux**, so it's safe to ship to everyone.

This is not a save-format problem, a mods problem, a Steam-build problem, or a case-sensitivity
problem — all of those were ruled out. The same save files load perfectly on Windows and on
Linux/Proton. The breakage is specific to how macOS-Wine reports the result of certain
filesystem calls back to the game's Mono runtime.

---

## What you see

- **New game:** the game's Bug Reporter pops up the instant the map starts generating.
- **Loading any save:** instant crash, or a "SAVE CORRUPTED – sorry!" popup.

`BepInEx/LogOutput.log` / Unity's `Player.log` show the failures inside the game's map code
(`MapOperator` / `MapEssentials.Map.GenerateMap`), never inside any gameplay mod.

---

## The three bugs (and the fixes)

All three are the same root theme: **a filesystem call that succeeds (or is a harmless no-op)
on Windows/Linux returns a different/garbage result under macOS-Wine, and the game's Mono code
isn't written to expect it.**

### 1. New-game crash — `File.Delete` of a missing file throws `IOException: "Success"`

The map streamer calls `FromCacheProvider.RemoveIfExists()` → `File.Delete(tileCacheFile)` for
**every** map tile. On Windows/Linux, deleting a file that doesn't exist is a silent no-op.
On macOS-Wine the delete fails **without setting an error code**, so Mono formats
`strerror(0)` = the string `"Success"` and throws `IOException("Success")`. The game doesn't
catch it → map generation dies → crash.

**Fix:** a Harmony *finalizer* on `File.Delete` / `File.Move` / `Directory.Delete` that swallows
**only** the spurious `"Success"` `IOException`. Real IO errors (sharing violation, access
denied, …) still propagate normally.

### 2. Save-load crash — `File.Exists` false-positive picks the wrong file

Saved map tiles are stored as `.bytes` (MessagePack). On load, `MapData.LoadFromFile` does:

```csharp
bool useJson = cacheParameters.FileExists(tile + ".json");   // is there a .json variant?
read( useJson ? tile + ".json" : tile + ".bytes" );
```

Under macOS-Wine, `File.Exists(tile.json)` returns **true even though only `tile.bytes`
exists**, so the loader tries to open the non-existent `.json`, gets `FileNotFoundException`,
and reports **"Loading save failed."**

**Fix:** a prefix on `CacheParameters.FileExists` that checks existence **reliably** — by
actually trying to *open* each candidate file. (A `FileStream` open correctly throws
`FileNotFound` for a missing file even when `File.Exists` lies.) Missing `.json` now reports
absent → the loader correctly reads the `.bytes` that's there.

### 3. Compressed/cloud saves won't unpack — `ZipFile.ExtractToDirectory` writes nothing

Saves are stored as `CompressedData.zip`. On load the game calls
`ZipFile.ExtractToDirectory(zip, saveDir)` to unpack the loose tile files. Under macOS-Wine
this produces **zero files** (the exception is caught and logged as a warning, so the load
silently proceeds with nothing to read). Curiously, **saving** (`ZipFile.CreateFromDirectory`)
works fine — only extraction is broken.

**Fix:** two parts —
- Disable save compression on this machine (`SaveHandler.DataCompressionEnabled = false`) so
  newly written saves stay as loose files (nothing to extract).
- For existing/cloud-synced zipped saves, a prefix on `SaveValidator.CheckIfCompressed` does
  the unzip **manually**, entry-by-entry (read each entry stream, write the bytes), which
  avoids whatever `ExtractToDirectory` chokes on (likely timestamp/attribute calls).

---

## Why it's safe on Windows & Linux

The plugin activates only when it detects **macOS-Wine**:

- Running under Wine? — `ntdll!wine_get_version` exists (P/Invoke succeeds).
- Running on macOS specifically? — `Z:\System\Library` exists (CrossOver maps `Z:` to the mac
  root; Linux Proton has no such path).

On **Windows** (`wine_get_version` missing) and **Linux** (no mac marker) the plugin logs
"inert" and patches nothing — gameplay and save format are 100% vanilla. Saves made on macOS
stay loadable on every platform.

---

## Install

The standard installer copies `plugins/*.dll`, so `IFZMacFix.dll` installs automatically with
the rest of the mods. No configuration. Press nothing — it self-activates only on macOS.

Mac/CrossOver reminder: BepInEx needs the `winhttp` DLL override set to **native,builtin
(native first)** in the bottle's `winecfg` → Libraries. Do **not** put `WINEDLLOVERRIDES` in
Steam launch options under CrossOver (that triggers a "no Windows program configured to open
this type of file" error).

## Build from source

`src/IFZMacFix/MacFix.cs`, compiled against `BepInEx.dll`, `0Harmony.dll`,
`UnityEngine.dll`, `UnityEngine.CoreModule.dll`, `netstandard.dll`,
`System.IO.Compression.dll`, `System.IO.Compression.FileSystem.dll` from the game's
`Infection Free Zone_Data/Managed`. Target a class library; drop the resulting
`IFZMacFix.dll` in `BepInEx/plugins`.
