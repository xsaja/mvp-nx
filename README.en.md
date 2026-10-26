<h1 align="center">mvp-nx</h1>

<p align="center">
  <b>MVP Baseball 2005</b> (Xbox, 2005) on the <b>Nintendo Switch</b>,<br>
  statically recompiled from the original Xbox executable — no emulator.
</p>

<p align="center">
  <a href="https://xsaja.github.io/mvp-nx/"><b>Installer</b></a> ·
  <a href="https://github.com/xsaja/mvp-nx/releases"><b>Releases</b></a> ·
  <a href="#credits"><b>Credits</b></a> ·
  🇪🇸 <a href="README.md"><b>Español</b></a>
</p>

The game's x86 code is translated to C++ and built as a native Switch program. A runtime stands in for the Xbox
kernel, its Direct3D 8 (on Vulkan/NVK) and its audio. It starts from maddog847's **MVP05 XBE Recomp** Windows port,
TGP482's **[XboxXBE-Recomp](https://github.com/TGP482/XboxXBE-Recomp)** recompiler and the Switch layer of
**[BLACK-NX-PORT](https://github.com/gerisson1996/BLACK-NX-PORT)**.

> [!IMPORTANT]
> **No game data is included.** You need your own copy of *MVP Baseball 2005* for the original Xbox
> (title ID `45410056`).

## What works

- Boot, movies, menus, music and sound.
- Full exhibition games, tested on the console.
- A 60 fps cap by default: 45–57 fps in a game. With `fps_cap = 30`, a fully steady 30 fps.
- 1280×720 handheld and 1920×1080 docked, switching on its own.
- Up to 4 controllers, with rumble.
- FPS and resolution in Status Monitor / Horizon OC Monitor, and handheld/docked mode from ReverseNX-RT (these need
  SaltyNX).

Not everything has been played. If something breaks, report it with the log (see [Problems](#problems)).

## Installation

You need a Switch running **Atmosphère** and your own copy of the game: the disc image (`.iso`, a full dump or an
xiso) or the extracted disc (the folder with `default.xbe`).

1. On a computer, open the **[installer](https://xsaja.github.io/mvp-nx/)** in Chrome, Edge or Firefox, and choose
   your disc image or game folder. It checks that the game is the right one and saves **`mvp-nx.zip`**. Everything
   happens in your browser: your game files are never uploaded.
2. Extract the zip into the **`switch`** folder of the microSD card. You get:
   ```
   sdmc:/switch/mvp05/
   ├── mvp05.nro             the game
   ├── mvp05-settings.toml   settings
   ├── LICENSES.txt
   └── game/                 your disc's files (default.xbe, data/, ...)
   ```
3. On the Switch, start **MVP Baseball 2005** in **title mode** in one of these ways:
   - Hold **R** while starting any installed game to open the Homebrew Menu, then pick it.
   - Start it from sphaira.
   - Start it through a forwarder.

   Applet mode (the Album) does not have enough memory.

Saves go to `sdmc:/switch/mvp05/hdd/`.

<details>
<summary>Installing by hand</summary>

1. Download `mvp05.nro`, `mvp05-settings.toml` and `LICENSES.txt` from the
   [latest release](https://github.com/xsaja/mvp-nx/releases/latest) into `sdmc:/switch/mvp05/`.
2. Copy every file of the disc into `sdmc:/switch/mvp05/game/`, or put the `.iso` there.

Copy with a card reader if you can: some MTP tools skip folders without saying so.
</details>

## Controls

The face buttons map **by position**, as on an Xbox pad, which is how MVP throws to the bases:

| Switch | Xbox | On defense |
|---|---|---|
| B (bottom) | A | home |
| A (right) | B | first |
| X (top) | Y | second |
| Y (left) | X | third |
| R / L | black / white | |
| ZL / ZR | triggers | |
| + / − | Start / Back | |

To map the buttons by letter instead (Switch A = Xbox A), set `buttons_by_name = true` in the settings.

## Settings

The settings are in `mvp05-settings.toml`, next to the NRO. The file explains each one (in Spanish). The most useful:

| Setting | Effect |
|---|---|
| `fps_cap = 30` | A fully steady 30 fps instead of the 60 cap (45–57 fps in a game). |
| `render_percent = 75` | Lowers the internal resolution, in case the game is slow. |
| `cpu_mhz`, `gpu_mhz`, `mem_mhz` | Raises the clocks while the game runs (official caps: 1785, 921, 1600). Leave them at 0 if you use Horizon OC or sys-clk. |
| `buttons_by_name = true` | Maps the buttons by letter instead of by position. |
| `saltynx = false` | Turns off the link with the console overlays. |

## Problems

- The game writes `sdmc:/switch/mvp05/logs/mvp05.log`. If it closes with an error, open an
  [issue](https://github.com/xsaja/mvp-nx/issues) and attach the log, the report from
  `sdmc:/atmosphere/crash_reports/`, and what you were doing.
- **Orange bands** appear in the end-of-inning transition. The Windows port has them too.
- The first time an effect appears, the game may stutter while its shader compiles. After that the shader is cached.
- When docked, Ultrahand does not open while the console's "screen size" is at 96%. Set it to 100%.
- There is no online play.

## Building from source

<details>
<summary>Windows (PC) and Nintendo Switch</summary>

Everything runs on Windows.

1. **Install the tools.**
   - For the PC build: Visual Studio 2026 with C++ and its Clang component, CMake, Ninja and Python 3.
   - For the Switch build: MSYS2 with [devkitPro](https://devkitpro.org/wiki/Getting_Started) (`switch-dev`,
     `switch-zlib`, `switch-libzstd`, `switch-libexpat`).
2. **Get NVK.** Build [mesa-switch](https://github.com/danfromtico/mesa-switch) as static libraries, or use a prebuilt
   SDK. Then point `nvk_sdk/` at its `opt/devkitpro/portlibs/switch` folder.
3. **Add the game.** Put your `default.xbe` and its folders in `game/assets/`. Never commit those files or
   `game/generated/`.
4. **Recompile.** Run `tools\build_pc.cmd`. It builds the recompiler, translates the xbe into `game/generated/game/`,
   and builds `MVP05-vk.exe` and `MVP05-d3d12.exe` for testing on the PC.
5. **Build the NRO.** In the MSYS2 shell, run `JOBS=8 switch/build.sh`. The result is `build-switch/mvp05.nro`.
   - `VERBOSE=ON` makes the log detailed.
   - A `switch/icon.jpg` (256×256), if present, becomes the icon.
6. **Make the SD package.** Run `tools\package_switch.ps1`, which writes `switch_sd/switch/mvp05/`. If a license
   changed, run `python tools/make_licenses.py` first.

The web installer is in `installer/`. To test it locally:
1. Copy `mvp05.nro`, `LICENSES.txt` and `switch/mvp05-settings.toml` into `installer/release/`.
2. Run `python installer/serve.py 8194 installer`.
</details>

## How it was made

[docs/notas-tecnicas.md](docs/notas-tecnicas.md) (in Spanish) covers:
- what the port is built from;
- the MVP fixes that were kept;
- the bugs found, and how they were found;
- the performance work;
- the debugging tools.

| Path | What |
|---|---|
| `switch/` | The Switch layer: startup, settings, log, Vulkan/NVK, audio, controllers, clocks, overlays |
| `sdk/` | The recompilation SDK (MVP's and TGP482's) with the Switch patches |
| `game/` | The recompiler's configuration and the game's own code (hooks, scripted pad) |
| `pc/` | Windows builds for comparing Vulkan with D3D12 |
| `installer/` | The installer page |
| `tools/` | Build, package, licenses and capture comparison |

## Credits

- **MVP05 XBE Recomp / Title-ID Update:** maddog847.
- **[XboxXBE-Recomp](https://github.com/TGP482/XboxXBE-Recomp)** (the recompiler and SDK): TGP482.
- **[BLACK-NX-PORT](https://github.com/gerisson1996/BLACK-NX-PORT)** (base of the Switch layer): gerisson1996.
- **[Black-Android](https://github.com/RanggaCasper/Black-Android)** (where the Vulkan backend comes from): RanggaCasper.
- **NVK:**
  - [mesa-switch](https://github.com/danfromtico/mesa-switch), by danfromtico.
  - The Mesa 26.2.4 build, by NaGaa95, shared by StevensND.
  - The Mesa authors.
- **Overlays:**
  - [SaltyNX](https://github.com/masagrator/SaltyNX), by masagrator and shinyquagsire23.
  - The overlay guide of [NFSMW-NX](https://github.com/StevensND/nfsmw-nx), by StevensND.
- **Installer:** adapted from R-drg's [defjam-sw-installer](https://github.com/R-drg/defjam-sw-installer), itself from
  StevensND's [nfsmw-nx-installer](https://github.com/StevensND/nfsmw-nx-installer).
- **Libraries:**
  - [libnx](https://github.com/switchbrew/libnx) and [devkitPro](https://devkitpro.org).
  - glslang, Dear ImGui, toml++, SDL, Zydis, zstd, expat and zlib.

## License

The code in this repository is released under the **GPL-3.0** ([LICENSE](LICENSE)). Third-party parts keep their own
licenses, all collected in [LICENSES.txt](LICENSES.txt).

<sub>MVP Baseball 2005 © 2005 Electronic Arts Inc. This is an unofficial fan project, not affiliated with Electronic
Arts, Major League Baseball, the MLBPA, Microsoft or Nintendo. The NRO contains code translated from the game's
executable but no game data: you need your own legally obtained copy.</sub>
