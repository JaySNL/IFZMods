# Fix plan: Hives "dogs only" + SplitUnlock "wall too short"

Two mod bugs, diagnosed from decompiled DLLs (game build 0.26.6.16, `Ifz.dll`).
Apply against the real mod source (Windows box). Both fixes are small.

---

## Bug 1 — Hives only spawns dogs (and floods)

**Symptom:** every seeded hive spawns the same unit type (dogs); map fills with identical groups.

**Root cause** — `Hives` 0.1.1, `HivesDriver.SeedNow()`:

```csharp
// picks ONE infected draft and reuses it for every hive
draft = hideoutDrafts.FirstOrDefault(x => x != null && (int)x.Fraction == 1);
_draft = (HideoutDraft)draft;
...
// PlaceBatch(): same _draft every placement
instance.TryInstantiateHideout(_draft, building);
```

`Fraction == 1` is correct (`Fraction { Player=0, Infected=1, Bandits=2, ... }`), but
`FirstOrDefault` always returns the first infected `HideoutDraft` — the dog nest — so all
12 hives are dogs.

**Fix** — collect *all* infected drafts, pick one per hive:

```csharp
// field: replace  HideoutDraft _draft;  with
private List<HideoutDraft> _drafts;

// SeedNow():
_drafts = hideoutDrafts
    .Where(x => x != null && (int)x.Fraction == 1)
    .ToList();
if (_drafts.Count == 0) { /* existing "no infected draft" skip+flag path */ }
if (Plugin.Verbose.Value)
    Plugin.Log.LogInfo($"[Hives] {_drafts.Count} infected drafts: " +
        string.Join(", ", _drafts.Select(d => d.name)));

// PlaceBatch(): per-placement draft instead of _draft
var draft = _drafts[UnityEngine.Random.Range(0, _drafts.Count)];
val3 = instance.TryInstantiateHideout(draft, val);
```

**Caveat / verify first:** this only adds variety if the game defines more than one
`Fraction==1` `HideoutDraft`. The verbose line logs the count + names — run once to confirm.
If there is only the dog draft, "dogs only" is the game's data, not selectable here (would
need a different mechanism, e.g. editing group composition).

**Flood:** `HiveCount` already defaults to 12 (was 50). If still too many, lower it; note hives
are seeded ONCE per new game and saved with it (re-tune on a fresh/pre-seed save).

---

## Bug 2 — SplitUnlock: "At least one of the walls is too short"

**Symptom:** drawing a custom building with a short wall is rejected — SplitUnlock doesn't bypass it.

**Root cause** — not a split check; it's custom-building validation in
`Gameplay.Rebuilding.CustomBuildings.CustomBuildingData.TestIsValid()`:

```csharp
else if (!WallsHasMinimalLenght())          // any segment < _config.MinWallLength
    InValidReason = InvalidReason.WallSize;  // -> "Buidling.Create.Warning_WallLength"
```

```csharp
private bool WallsHasMinimalLenght() {
    for (int i = 0; i < _points.Count; i++)
        if (_points.GetSegmentXZ(i).Length < _config.MinWallLength) return false;
    return true;
}
```

SplitUnlock 1.1.0 already postfix-patches the sibling checks `IsBelowMaximalAreaSize`
and `HasMinimalAreaSize` (the `MaxAreaPatch` / `MinAreaPatch` classes). The wall-length
check just isn't covered yet.

**Fix** — same pattern, new patch class + config toggle:

```csharp
// Plugin.Awake(): new config (BuildingSize section)
AllowShortWalls = Config.Bind("BuildingSize", "AllowShortWalls", true,
    "Allow custom buildings with walls shorter than the game minimum (MinWallLength). " +
    "On = bypass the 'at least one of the walls is too short' rejection.");

// new patch class (mirror MaxAreaPatch)
[HarmonyPatch(typeof(CustomBuildingData), "WallsHasMinimalLenght")]
internal static class WallLengthPatch {
    private static void Postfix(ref bool __result) {
        if (Plugin.AllowShortWalls.Value) __result = true;
    }
}
```

`WallsHasMinimalLenght` is `private`; Harmony patches it fine (same as the area methods).
Tie to the new `AllowShortWalls` (or reuse `OverrideBuildingSize` if you prefer one toggle).

---

## Notes
- Both verified against `CustomBuildingData` / `HideoutDraft` / `Fraction` in `Ifz.dll`.
- macOS/CrossOver build/test toolchain (no Windows needed): bottle `csc` compile + `ilspycmd`
  decompile — see `project_ifz_macos_modding` memory.
