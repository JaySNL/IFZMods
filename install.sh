#!/usr/bin/env bash
# IFZMods installer — macOS / Linux / Steam Deck
# Downloads BepInEx 5.4.23.2 Windows x64 (game is Windows-binary; runs via Proton/Wine).
# Idempotent: safe to re-run for upgrades.
set -euo pipefail

BEPINEX_URL="https://github.com/BepInEx/BepInEx/releases/download/v5.4.23.2/BepInEx_win_x64_5.4.23.2.zip"
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

find_game_dir() {
  local candidates=(
    "$HOME/.steam/steam/steamapps/common/Infection Free Zone"
    "$HOME/.local/share/Steam/steamapps/common/Infection Free Zone"
    "/home/deck/.steam/steam/steamapps/common/Infection Free Zone"
    "/run/media/mmcblk0p1/steamapps/common/Infection Free Zone"
    "$HOME/Library/Application Support/Steam/steamapps/common/Infection Free Zone"
    "$HOME/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/Infection Free Zone"
  )
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

# BepInEx
if [ ! -f "$GAME/winhttp.dll" ]; then
  echo "Downloading BepInEx 5.4.23.2..."
  TMP="$(mktemp -d)"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL -o "$TMP/bepinex.zip" "$BEPINEX_URL"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$TMP/bepinex.zip" "$BEPINEX_URL"
  else
    echo "ERROR: need curl or wget" >&2; exit 1
  fi
  echo "Extracting..."
  if command -v unzip >/dev/null 2>&1; then
    unzip -oq "$TMP/bepinex.zip" -d "$GAME"
  else
    echo "ERROR: need unzip" >&2; exit 1
  fi
  rm -rf "$TMP"
  echo "BepInEx installed."
else
  echo "BepInEx already present — skipping download."
fi

# Plugins
DEST="$GAME/BepInEx/plugins"
mkdir -p "$DEST/ConfigurationManager"

echo "Copying mods..."
for f in "$REPO_ROOT/plugins"/*.dll; do
  [ -f "$f" ] || continue
  cp -f "$f" "$DEST/"
  echo "  + $(basename "$f")"
done
if [ -f "$REPO_ROOT/plugins/ConfigurationManager/ConfigurationManager.dll" ]; then
  cp -f "$REPO_ROOT/plugins/ConfigurationManager/ConfigurationManager.dll" "$DEST/ConfigurationManager/"
  echo "  + ConfigurationManager/ConfigurationManager.dll"
fi

echo ""
echo "Done."
echo ""
echo "Steam Deck / Linux / macOS launch option (REQUIRED — Proton/Wine ignores BepInEx without this):"
echo ""
echo '    WINEDLLOVERRIDES="winhttp=n,b" %command%'
echo ""
echo "Set it: Steam → Infection Free Zone → Properties → Launch Options."
echo "Then launch the game. Press F1 in-game to configure mods."
