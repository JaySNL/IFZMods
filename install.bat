@echo off
title IFZMods Installer
echo ============================================
echo    IFZMods Installer
echo ============================================
echo.
echo This installs BepInEx + all mods into
echo Infection Free Zone. No setup needed.
echo.

REM Use the install.ps1 sitting next to this file if present (full repo download),
REM otherwise pull the latest installer straight from GitHub. Either way we run it
REM with -ExecutionPolicy Bypass so Windows' script-blocking does not get in the way.
if exist "%~dp0install.ps1" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "iex (irm 'https://raw.githubusercontent.com/JaySNL/IFZMods/main/install.ps1')"
)

echo.
echo ============================================
echo    Finished. You can close this window.
echo ============================================
echo.
pause
