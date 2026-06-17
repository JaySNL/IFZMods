# How to install IFZMods — the super easy way

This guide is for people who have **never modded a game before**. No commands, no coding. Just follow the steps. It takes about 2 minutes.

> 💡 You need the game **Infection Free Zone** installed through **Steam** first. If you can play the game, you're good.

---

## Step 1 — Download the installer

1. Click this link: **[install.bat](https://github.com/JaySNL/IFZMods/raw/main/install.bat)**
2. Your browser downloads a file called **`install.bat`** (it goes to your **Downloads** folder).

> If your browser asks *"Keep this file?"* or says it's *"not commonly downloaded"*, click **Keep**. It's safe — it just copies the mods into your game.

---

## Step 2 — Run it

1. Open your **Downloads** folder.
2. **Double-click** `install.bat`.
3. A black window pops up and does everything for you — finds your game, downloads the mod loader, and installs all the mods.
4. When it says **"Finished. You can close this window."** — you're done. Close it.

That's it. 🎉

---

## Step 3 — Play

1. Start **Infection Free Zone** like normal.
2. Once you're in a game, press **F1** on your keyboard.
3. A menu appears where you can turn each mod on/off and change its settings.

---

## "Windows is warning me!" — that's normal

Windows doesn't recognize the file because it's not from a big company, so it may show a blue box:

> **Windows protected your PC**

Just click:

1. **More info**
2. **Run anyway**

This happens with almost every small free tool. The installer only copies mod files into your game folder — nothing else.

---

## "Smart App Control blocked it / may be unsafe"

This is a **different, stricter** Windows 11 feature called **Smart App Control (SAC)**. Unlike the warning above, it does **not** give you a "Run anyway" button — it just blocks the file. You have two ways around it.

### Option A — Install by hand (no script runs, SAC can't block it) ✅ recommended

This is the same install, just done by copying files yourself. Smart App Control blocks *running programs*, not *copying files*, so this gets past it.

1. **Download the mods:** on the [main repo page](https://github.com/JaySNL/IFZMods), click the green **`<> Code`** button → **Download ZIP**. Unzip it (right-click → **Extract All**). You now have a folder with a **`plugins`** folder inside.
2. **Download BepInEx** (the mod loader): get **[BepInEx_win_x64_5.4.23.2.zip](https://github.com/BepInEx/BepInEx/releases/download/v5.4.23.2/BepInEx_win_x64_5.4.23.2.zip)** and unzip it.
3. **Find your game folder:** in Steam, right-click **Infection Free Zone → Manage → Browse local files**. This opens the folder that has `Infection Free Zone.exe`.
4. **Copy BepInEx in:** copy everything from the unzipped BepInEx folder (`winhttp.dll`, the `BepInEx` folder, `doorstop_config.ini`, etc.) **into the game folder** next to `Infection Free Zone.exe`.
5. **Copy the mods in:** open `BepInEx\plugins` inside the game folder, then copy **everything from the repo's `plugins` folder** into it.
6. Start the game, press **F1**.

Done — nothing was "run", so SAC stays happy.

### Option B — Turn Smart App Control off (quick, but read the warning)

1. Press **Start**, type **Smart App Control**, open **Smart App Control settings**.
2. Set it to **Off**.
3. Now run `install.bat` normally.

> ⚠️ **Important:** once you turn Smart App Control **off, Windows can't turn it back on** — re-enabling it requires a full Windows reset. If that bothers you, use **Option A** instead.

> ℹ️ If you did the manual install (Option A) and the game runs but **no mods load / no F1 menu**, Smart App Control may also be blocking the mod loader (`winhttp.dll`) itself. In that case Option B is the only fix — or wait for a signed release.

---

## How to update later

New mods or fixes? Just **download `install.bat` again and double-click it again.** It safely overwrites the old files with the new ones. You won't lose anything.

---

## Steam Deck, Linux, or Mac?

The one-click `.bat` is for **Windows**. On the others it's still easy, but there's **one extra step** so the mods actually load:

1. Download the installer for your system:
   - **Steam Deck / Linux:** [install.sh](https://github.com/JaySNL/IFZMods/raw/main/install.sh)
   - **Mac:** [install.sh](https://github.com/JaySNL/IFZMods/raw/main/install.sh)
2. Run it (on Deck, switch to Desktop Mode first, then double-click it / run it in a terminal).
3. **Add this launch option** so mods load. In Steam: right-click **Infection Free Zone → Properties → Launch Options**, and paste exactly this:
   ```
   WINEDLLOVERRIDES="winhttp=n,b" %command%
   ```
4. Start the game, press **F1**.

> Without that launch option, the game runs fine but **the mods won't show up**. If your mods aren't loading on Deck/Linux/Mac, this is almost always why.

---

## It's not working — quick checklist

| Problem | Fix |
|---|---|
| Double-clicked `.bat`, window flashed and vanished | Right-click `install.bat` → **Run as administrator**. If it still flashes, your game may be in an unusual folder — see below. |
| "Game not auto-detected" | The window will ask you to **paste the path** to your game folder (the one with `Infection Free Zone.exe`). In Steam: right-click the game → **Manage → Browse local files**, copy that folder's address from the bar at the top, paste it in, press Enter. |
| Game launches but **no mods / no F1 menu** | **Windows:** re-run `install.bat`. **Steam Deck/Linux/Mac:** you're missing the launch option above. |
| Antivirus blocked it | Allow/whitelist the file. It's open-source — you can read exactly what it does in [install.ps1](https://github.com/JaySNL/IFZMods/blob/main/install.ps1). |

---

## Still stuck?

Ask in the Discord and include:
- What system you're on (Windows / Steam Deck / Linux / Mac)
- What the black installer window said (a screenshot is perfect)

We'll get you sorted. 👍
