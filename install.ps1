<#
  IFZMods installer - Windows
  Downloads BepInEx 5.4.23.2 x64 + drops in this repo's plugin DLLs.
  Idempotent: safe to re-run for upgrades.
#>

$ErrorActionPreference = "Stop"
$BepInExUrl = "https://github.com/BepInEx/BepInEx/releases/download/v5.4.23.2/BepInEx_win_x64_5.4.23.2.zip"
$BepInExFile = "BepInEx_x64.zip"
$RepoRoot = $PSScriptRoot

function Find-GameDir {
    $candidates = @(
        "C:\Program Files (x86)\Steam\steamapps\common\Infection Free Zone",
        "C:\Program Files\Steam\steamapps\common\Infection Free Zone",
        "D:\SteamLibrary\steamapps\common\Infection Free Zone",
        "D:\Steam\steamapps\common\Infection Free Zone",
        "E:\SteamLibrary\steamapps\common\Infection Free Zone",
        "X:\Steam\steamapps\common\Infection Free Zone"
    )
    foreach ($p in $candidates) { if (Test-Path "$p\Infection Free Zone.exe") { return $p } }
    return $null
}

$Game = Find-GameDir
if (-not $Game) {
    Write-Host "Game not auto-detected." -ForegroundColor Yellow
    $Game = Read-Host "Enter full path to Infection Free Zone folder (contains 'Infection Free Zone.exe')"
}
if (-not (Test-Path "$Game\Infection Free Zone.exe")) {
    Write-Host "ERROR: 'Infection Free Zone.exe' not at '$Game'" -ForegroundColor Red
    exit 1
}
Write-Host "Game: $Game" -ForegroundColor Cyan

# BepInEx
if (-not (Test-Path "$Game\winhttp.dll")) {
    Write-Host "Downloading BepInEx 5.4.23.2..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $BepInExUrl -OutFile "$env:TEMP\$BepInExFile" -UseBasicParsing
    Write-Host "Extracting BepInEx..." -ForegroundColor Cyan
    Expand-Archive -Path "$env:TEMP\$BepInExFile" -DestinationPath $Game -Force
    Remove-Item "$env:TEMP\$BepInExFile" -Force
    Write-Host "BepInEx installed." -ForegroundColor Green
} else {
    Write-Host "BepInEx already present - skipping download." -ForegroundColor DarkGray
}

# Plugins
$PluginDest = "$Game\BepInEx\plugins"
New-Item -ItemType Directory -Force -Path $PluginDest | Out-Null
New-Item -ItemType Directory -Force -Path "$PluginDest\ConfigurationManager" | Out-Null

Write-Host "Copying mods..." -ForegroundColor Cyan
Get-ChildItem "$RepoRoot\plugins" -Filter *.dll | ForEach-Object {
    Copy-Item $_.FullName "$PluginDest\$($_.Name)" -Force
    Write-Host "  + $($_.Name)" -ForegroundColor DarkGray
}
if (Test-Path "$RepoRoot\plugins\ConfigurationManager\ConfigurationManager.dll") {
    Copy-Item "$RepoRoot\plugins\ConfigurationManager\ConfigurationManager.dll" "$PluginDest\ConfigurationManager\ConfigurationManager.dll" -Force
    Write-Host "  + ConfigurationManager/ConfigurationManager.dll" -ForegroundColor DarkGray
}

Write-Host "`nDone." -ForegroundColor Green
Write-Host "Launch the game. Press F1 in-game to configure mods." -ForegroundColor Cyan
