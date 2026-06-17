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

# BepInEx — require ALL key pieces, not just winhttp.dll (a partial copy missing
# doorstop_config.ini or the core preloader leaves BepInEx unable to bootstrap).
$BepInExComplete = (Test-Path "$Game\winhttp.dll") -and `
                   (Test-Path "$Game\doorstop_config.ini") -and `
                   (Test-Path "$Game\BepInEx\core\BepInEx.Preloader.dll")
if (-not $BepInExComplete) {
    Write-Host "Installing BepInEx 5.4.23.2..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $BepInExUrl -OutFile "$env:TEMP\$BepInExFile" -UseBasicParsing
    Write-Host "Extracting BepInEx..." -ForegroundColor Cyan
    Expand-Archive -Path "$env:TEMP\$BepInExFile" -DestinationPath $Game -Force
    Remove-Item "$env:TEMP\$BepInExFile" -Force
    Write-Host "BepInEx installed." -ForegroundColor Green
} else {
    Write-Host "BepInEx already present - skipping download." -ForegroundColor DarkGray
}

# Resolve plugin source: a local clone next to this script, else download the repo from GitHub.
# (Running the raw install.ps1 standalone — or via `irm ... | iex` — has no local plugins folder.)
$PluginSource = if ($RepoRoot) { Join-Path $RepoRoot "plugins" } else { $null }
if (-not $PluginSource -or -not (Test-Path $PluginSource)) {
    Write-Host "Downloading IFZMods from GitHub..." -ForegroundColor Cyan
    $RepoZip = "$env:TEMP\IFZMods.zip"
    $ExtractDir = "$env:TEMP\IFZMods_extract"
    Invoke-WebRequest -Uri "https://github.com/JaySNL/IFZMods/archive/refs/heads/main.zip" -OutFile $RepoZip -UseBasicParsing
    if (Test-Path $ExtractDir) { Remove-Item $ExtractDir -Recurse -Force }
    Expand-Archive -Path $RepoZip -DestinationPath $ExtractDir -Force
    $PluginSource = Join-Path $ExtractDir "IFZMods-main\plugins"
    Remove-Item $RepoZip -Force
}
if (-not (Test-Path $PluginSource)) {
    Write-Host "ERROR: could not locate mod plugins (local or downloaded)." -ForegroundColor Red
    exit 1
}

# Plugins
$PluginDest = "$Game\BepInEx\plugins"
New-Item -ItemType Directory -Force -Path $PluginDest | Out-Null
New-Item -ItemType Directory -Force -Path "$PluginDest\ConfigurationManager" | Out-Null

Write-Host "Copying mods..." -ForegroundColor Cyan
Get-ChildItem "$PluginSource" -Filter *.dll | ForEach-Object {
    Copy-Item $_.FullName "$PluginDest\$($_.Name)" -Force
    Write-Host "  + $($_.Name)" -ForegroundColor DarkGray
}
if (Test-Path "$PluginSource\ConfigurationManager\ConfigurationManager.dll") {
    Copy-Item "$PluginSource\ConfigurationManager\ConfigurationManager.dll" "$PluginDest\ConfigurationManager\ConfigurationManager.dll" -Force
    Write-Host "  + ConfigurationManager/ConfigurationManager.dll" -ForegroundColor DarkGray
}

# Strip Mark-of-the-Web from everything we placed. Files pulled from the internet
# carry a Zone.Identifier that makes Windows silently refuse to LOAD the DLLs
# (BepInEx then never starts → F1 only changes game speed). Unblock fixes that.
Write-Host "Unblocking files (clearing 'downloaded from internet' flag)..." -ForegroundColor Cyan
foreach ($f in @("$Game\winhttp.dll", "$Game\doorstop_config.ini", "$Game\.doorstop_version")) {
    if (Test-Path $f) { Unblock-File -Path $f -ErrorAction SilentlyContinue }
}
Get-ChildItem "$Game\BepInEx" -Recurse -File -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

Write-Host "`nDone." -ForegroundColor Green
Write-Host "Launch the game. Press F1 in-game to configure mods." -ForegroundColor Cyan
Write-Host "If F1 only changes game speed, Smart App Control is blocking BepInEx - turn it Off." -ForegroundColor Yellow
