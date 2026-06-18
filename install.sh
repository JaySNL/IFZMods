#!/usr/bin/env bash
# IFZMods installer — macOS / Linux / Steam Deck (CrossOver, Proton, Wine)
# Downloads BepInEx 5.4.23.2 Windows x64 (game is a Windows binary; runs via Proton/Wine/CrossOver).
# Idempotent: safe to re-run for upgrades. Safe to run via `curl ... | bash`.
set -euo pipefail

BEPINEX_URL="https://github.com/BepInEx/BepInEx/releases/download/v5.4.23.2/BepInEx_win_x64_5.4.23.2.zip"
REPO_ZIP_URL="https://github.com/JaySNL/IFZMods/archive/refs/heads/main.zip"

# When piped through `curl | bash`, BASH_SOURCE[0] is unset. Under `set -u` that
# aborts with "unbound variable" and (pre-fix) left REPO_ROOT empty, so the
# plugin glob matched nothing and ZERO mods were copied. Guard the expansion and
# treat "no local repo" as the signal to download the repo from GitHub instead.
SRC="${BASH_SOURCE[0]:-}"
if [ -n "$SRC" ]; then
  REPO_ROOT="$( cd "$( dirname "$SRC" )" && pwd )"
else
  REPO_ROOT=""
fi

dl() {  # dl <url> <out>
  if command -v curl >/dev/null 2>&1; then curl -fsSL -o "$2" "$1"
  elif command -v wget >/dev/null 2>&1; then wget -qO "$2" "$1"
  else echo "ERROR: need curl or wget" >&2; exit 1; fi
}

find_game_dir() {
  local candidates=(
    "$HOME/.steam/steam/steamapps/common/Infection Free Zone"
    "$HOME/.local/share/Steam/steamapps/common/Infection Free Zone"
    "/home/deck/.steam/steam/steamapps/common/Infection Free Zone"
    "/run/media/mmcblk0p1/steamapps/common/Infection Free Zone"
    "$HOME/Library/Application Support/Steam/steamapps/common/Infection Free Zone"
    "$HOME/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/Infection Free Zone"
  )
  local p
  for p in "${candidates[@]}"; do
    if [ -f "$p/Infection Free Zone.exe" ]; then echo "$p"; return 0; fi
  done
  return 1
}

GAME=""
if GAME="$(find_game_dir)"; then
  echo "Game: $GAME"
else
  echo "Game not auto-detected."
  read -r -p "Enter full path to Infection Free Zone folder: " GAME
fi

if [ ! -f "$GAME/Infection Free Zone.exe" ]; then
  echo "ERROR: 'Infection Free Zone.exe' not found at '$GAME'" >&2
  exit 1
fi

# BepInEx — require ALL key pieces, not just winhttp.dll. A partial copy missing
# doorstop_config.ini or the core preloader leaves BepInEx unable to bootstrap.
if [ -f "$GAME/winhttp.dll" ] && [ -f "$GAME/doorstop_config.ini" ] \
   && [ -f "$GAME/BepInEx/core/BepInEx.Preloader.dll" ]; then
  echo "BepInEx already present — skipping download."
else
  echo "Downloading BepInEx 5.4.23.2..."
  TMP="$(mktemp -d)"
  dl "$BEPINEX_URL" "$TMP/bepinex.zip"
  echo "Extracting..."
  command -v unzip >/dev/null 2>&1 || { echo "ERROR: need unzip" >&2; exit 1; }
  unzip -oq "$TMP/bepinex.zip" -d "$GAME"
  rm -rf "$TMP"
  echo "BepInEx installed."
fi

# Resolve plugin source: a local clone next to this script, else download the
# repo from GitHub. Running the raw install.sh standalone — or via `curl | bash`
# — has no local plugins folder, which is exactly how mods silently went missing.
PLUGIN_SRC=""
if [ -n "$REPO_ROOT" ] && [ -d "$REPO_ROOT/plugins" ]; then
  PLUGIN_SRC="$REPO_ROOT/plugins"
else
  echo "Downloading IFZMods from GitHub..."
  command -v unzip >/dev/null 2>&1 || { echo "ERROR: need unzip" >&2; exit 1; }
  RTMP="$(mktemp -d)"
  dl "$REPO_ZIP_URL" "$RTMP/repo.zip"
  unzip -oq "$RTMP/repo.zip" -d "$RTMP"
  PLUGIN_SRC="$RTMP/IFZMods-main/plugins"
fi

if [ ! -d "$PLUGIN_SRC" ]; then
  echo "ERROR: could not locate mod plugins (local or downloaded)." >&2
  exit 1
fi

# Plugins
DEST="$GAME/BepInEx/plugins"
mkdir -p "$DEST/ConfigurationManager"

echo "Copying mods..."
copied=0
for f in "$PLUGIN_SRC"/*.dll; do
  [ -f "$f" ] || continue
  cp -f "$f" "$DEST/"
  echo "  + $(basename "$f")"
  copied=$((copied + 1))
done
if [ -f "$PLUGIN_SRC/ConfigurationManager/ConfigurationManager.dll" ]; then
  cp -f "$PLUGIN_SRC/ConfigurationManager/ConfigurationManager.dll" "$DEST/ConfigurationManager/"
  echo "  + ConfigurationManager/ConfigurationManager.dll"
  copied=$((copied + 1))
fi

# Fail loud if nothing landed — the old script printed "Done." with zero mods,
# so the only symptom was a dead F1 key in-game with no error anywhere.
if [ "$copied" -eq 0 ]; then
  echo "ERROR: no plugin DLLs were copied — check '$PLUGIN_SRC'." >&2
  exit 1
fi
echo "Copied $copied mod file(s)."

echo ""
echo "Done."
echo ""

# Tell the user how to actually make Wine load BepInEx — this differs by runtime,
# and getting it wrong is the #1 reason F1 does nothing.
case "$GAME" in
  *"/CrossOver/Bottles/"*)
    cat <<'EOF'
CrossOver (macOS) — REQUIRED, launch options do NOT work here:
  Pasting WINEDLLOVERRIDES=... into Steam's launch options makes CrossOver's
  Steam try to "open" it as a file → "There is no Windows program configured
  to open this type of file." Leave Steam launch options BLANK and instead:

    1. CrossOver -> select the Steam bottle -> Run Command -> run:  winecfg
    2. Libraries tab -> New override for library:  winhttp  -> Add
    3. Select "winhttp" -> Edit -> choose Native (Windows), then Builtin -> OK
       ORDER MATTERS: it must read  native,builtin  (native FIRST).
       builtin,native loads Wine's own winhttp and BepInEx never starts.
    4. Launch the game from Steam (launch options blank). Press F1 for the menu.
EOF
    ;;
  *)
    if [ "$(uname -s)" = "Darwin" ]; then
      cat <<'EOF'
macOS / Wine — REQUIRED:
  Set winhttp to load native-first so BepInEx's proxy DLL is used.
  In winecfg -> Libraries: add "winhttp", Edit -> Native then Builtin
  (must be native,builtin — native FIRST). Then launch and press F1.
EOF
    else
      cat <<'EOF'
Steam Deck / Linux (Proton/Wine) — REQUIRED launch option:

    WINEDLLOVERRIDES="winhttp=n,b" %command%

  Set it: Steam -> Infection Free Zone -> Properties -> Launch Options.
  Then launch the game. Press F1 in-game to configure mods.
EOF
    fi
    ;;
esac
