IFZMods — manual install (no installer, nothing runs)
=====================================================

Use this if the installer is blocked (Smart App Control / antivirus) or you
just prefer doing it by hand. It's only copying files, so nothing is "run"
and Windows can't block it.

STEPS
-----
1. Find your game folder:
   Steam -> right-click "Infection Free Zone" -> Manage -> Browse local files.
   (It's the folder that contains "Infection Free Zone.exe".)

2. Copy EVERYTHING inside this "manual-install" folder INTO that game folder.
   When asked, choose "Replace the files in the destination."
   You should end up with "winhttp.dll" sitting right next to
   "Infection Free Zone.exe", and a "BepInEx" folder there too.

3. Start the game. Press F1 to open the mod settings menu.

That's it.

NOTE ON SMART APP CONTROL
-------------------------
Copying these files is always allowed. BUT if Smart App Control is ON, it may
still block the loader (winhttp.dll) from running, so the game starts with no
mods and F1 only changes game speed. If that happens, Smart App Control has to
be turned Off (Start -> search "Smart App Control" -> Off). Turning it off is
permanent until a Windows reset.

Full guide: https://github.com/JaySNL/IFZMods/blob/main/INSTALL.md
