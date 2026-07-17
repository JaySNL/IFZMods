# Extraction task — @KEY@ public API surface → JSON

Template used by `tools/site/refresh-api-docs.sh` (placeholders @KEY@ / @DLL@ / @DIR@ are
substituted per API before dispatch). Read every `.cs` under `@DIR@/` in your worktree
(skip `obj/`, `bin/`). Produce a single JSON file describing the PUBLIC modder-facing API
surface. Write it to `@DIR@/_apidoc.json`.

## Output: valid JSON ONLY, matching this schema exactly

```json
{
  "key": "@KEY@",
  "title": "@KEY@",
  "dll": "@DLL@",
  "guid": "<the BepInPlugin GUID string from source, if any; else the assembly/namespace id>",
  "version": "<the plugin/assembly version string from source>",
  "blurb": "<one sentence: what this library is for>",
  "reference": {
    "bepInDependency": "[BepInDependency(\"<guid>\")]",
    "hintPath": "<Reference Include=\"@DIR@\"><HintPath>..\\\\@DIR@\\\\bin\\\\Release\\\\netstandard2.1\\\\@DIR@.dll</HintPath></Reference>",
    "notes": "Additive-only API. Do not version-pin the BepInDependency unless you require a specific minimum."
  },
  "types": [
    {
      "name": "<public type name>",
      "kind": "static class | class | struct | enum",
      "summary": "<what this type is for>",
      "members": [
        { "signature": "<exact public method/property signature as in source>",
          "params": [ { "name": "<p>", "type": "<T>", "desc": "<what it is>" } ],
          "returns": "<return type — meaning>",
          "remarks": "<when/how to call; caveats>" }
      ],
      "hooks": [
        { "name": "<Type.Event>", "signature": "<exact event/Action signature>",
          "when": "<when it fires>", "remarks": "<usage>" }
      ]
    }
  ],
  "example": "<short compilable C# snippet showing typical use>"
}
```

## Rules

- ONLY public, modder-facing types and members. Skip `private`/`internal`/Harmony patch classes.
- `signature` MUST be copied faithfully from the source (exact name, params, return type). Do NOT invent.
- `guid` = exact string in `[BepInPlugin("...")]` if present; else the root namespace/assembly name.
- `version` = version in `[BepInPlugin(..., "x.y.z")]` or the csproj.
- `hooks` = public events / `Action` / callback fields modders subscribe to. Empty array if none.
- Every type with public members gets an entry. Be exhaustive but public-only.
- Write ONLY the JSON to `@DIR@/_apidoc.json`. Confirm it parses.

Reply with: the file path written + the count of types + a one-line note.
