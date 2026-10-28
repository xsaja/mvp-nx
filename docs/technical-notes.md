# Technical notes

How mvp-nx is built, what was changed from its bases, and which bugs were found. For anyone who wants to build it, fix
something, or port another game made with the same SDK.

## Where it comes from

| Base | What it brings |
|---|---|
| **MVP05 XBE Recomp, Title-ID Update** (maddog847) | The Windows port: `config/game.toml`, `src/`, and the SDK with MVP's own fixes |
| **XboxXBE-Recomp** (TGP482) | The `xbe_recomp` recompiler and the runtime: Xbox kernel, Direct3D 8, DirectSound, XAPI |
| **BLACK-NX-PORT** (gerisson1996) | The Switch layer (`switch/`) and the SDK's Switch patches (memory, files, threads) |
| **Black-Android** (RanggaCasper) | The Vulkan backend `switch/vulkan.cpp` starts from |
| **deko3d, uam** (fincs), **SPIRV-Cross** (Khronos) | The deko3d backend (`switch/deko.cpp`) and its shader chain |
| **mesa-switch** (danfromtico; 26.2.4 build by NaGaa95) | NVK, the Vulkan driver linked statically into the NRO |

The x86 code of `default.xbe` is translated to C++ (`game/generated/game`, 128 partitions, never in git) and built for
ARM64 with devkitA64. The kernel and the XDK libraries are implemented at the API level.

## Layout

| Folder | Contents |
|---|---|
| `sdk/` | MVP's SDK with the Switch patches, always behind `#ifdef __SWITCH__` so the Windows build still compiles |
| `game/` | `config/game.toml`, `src/` (game info, hooks, scripted pad) and the Windows settings |
| `switch/` | The Switch layer: `main.cpp` (applet loop, settings, log, crashes), `deko.cpp` + `dk_core.cpp` + `dk_glsl.cpp` (deko3d), `vulkan.cpp`, `gfx_common.h` (shared by both renderers), `audio.cpp` (audren), `input.cpp` (HID), `game_files.cpp`, `clocks.cpp`, `overlays.cpp` (SaltyNX), `profiler.cpp`, CMake |
| `pc/` | `MVP05-vk.exe` and `MVP05-d3d12.exe`: MVP's Windows host with the Switch's Vulkan backend or with D3D12, for comparing on the PC |
| `installer/` | The page that builds the SD package from the player's copy |
| `tools/` | PC build, SD package, licenses, capture comparison, profile report, deko3d shader tests |
| `third_party/` | glslang (with HLSL), uam, SPIRV-Cross, Dear ImGui, toml++, Vulkan-Headers, SDL3 and Zydis (PC and recompiler only) |

## MVP fixes that are kept

MVP carries its own fixes on top of TGP482's SDK. Black does not have them, so MVP's files were kept:

- `xdk/d3d8.cpp`: walk the push buffer before `SetTexture`, the palette and `SetVertexShader`; a null viewport; inline
  arrays (`NV097_INLINE_ARRAY`) gathered across packets.
- `xdk/dsound.cpp`: `SetEG` accepted; default mixbins for 4 and 6 channels, all mixed down to stereo.
- `gpu/render_thread.cpp`: the "draw consumption" wait after each draw (replaced by `draw_copy`, see below).
- `kernel/xboxkrnl.cpp`: the HDTV AV pack and the 720p flag when `xbox_720p` is on; `XC_AUDIO_FLAGS`.
- From MVP's D3D12 renderer, carried over to Vulkan and deko3d: `PixelBoundary` with separate X/Y scales, a clamped
  `MipLODBias`, render targets read half a texel back, point scale and the screenshot.
- MVP's constant `cbuffer` has no `rtshift`: Black's backend was adapted to that.

## Bugs found

- **File reads over 1 MB wrote too much** (`sdk/runtime/kernel/files.cpp`, inherited from BLACK-NX-PORT). On the
  Switch reads go through a 1 MB bounce buffer, because the FS IPC rejects code memory. The chunk was computed as
  `min(len, 1 MB)` instead of `min(len - n, 1 MB)`, so a 3.05 MB read wrote 3.15 MB and overwrote the memory next to it.
  In MVP it broke a memory pool list while loading `anims.big`: the game closed 7 s after starting. It was found by
  comparing the Windows and Ryujinx I/O logs line by line.
- **Error on exit** (2345-0008, libnx NotInitialized). `kernel::Shutdown` ended with `_Exit`, and libnx closed HID while
  the game's controller thread still called `padUpdate`. `input::Stop()` now takes the input lock and turns HID off
  first.
- **Errors on exit with deko3d and from sphaira** (2359-0001 in `Swapchain::acquireImage`; 2168-0001 at the NRO base).
  The renderer kept presenting while libnx closed vi/nvdrv, and `_Exit` returned to a loader that stays resident while
  the guest threads were still running. Now `gpu::StopRendering()` closes a gate the renderer takes on every call, and
  the exit is `appletUnlockExit(); __appExit(); svcExitProcess();`.
- **`xbox_720p` must be `true`**, as in MVP's Windows package.

## The deko3d renderer

`switch/deko.cpp` implements the same `gpu::Backend` as `vulkan.cpp`, on deko3d.

- **Shaders.** The SDK writes HLSL; glslang turns it into SPIR-V (the cache `shadercache/<hash>_2.spv`, shared with
  Vulkan); `dk_glsl.cpp` turns SPIR-V into GLSL 4.60 with SPIRV-Cross (combined samplers at the texture's slot, the two
  constant buffers at 0 and 1); uam, built in as a library, compiles that to DKSH (`<hash>_2.dk1`) on its own thread.
  Every cached SPIR-V module is compiled at start, so a new install compiles once and then never stutters on shaders.
- **Core** (`dk_core.cpp`): device, queue, three work slots with fences, an upload ring per slot, an image heap,
  descriptors pushed with `dkCmdBufPushData`. Two deko3d 0.5.0 bugs are worked around: the tile size of some images,
  and `dkCmdBufBindVtxBuffers` writing past what it reserves (one buffer per call, plus 256 bytes of command slack).
- **Barriers by real hazard.** Each image records when it was last drawn, copied and sampled; a barrier is issued only
  when a draw reads something written since (1–3 a frame in a game, against one per upload and copy before).
- **What the Switch GPU does natively:** fans, quads, quad strips, polygons and line loops, and packed 3-component 16
  and 8 bit vertices (6 or 3 byte strides), are drawn as they are instead of being rebuilt on the CPU.

On the console the deko3d GPU time was 28% below NVK's for the same shaders, and the driver's ~5–6 ms a frame of CPU
time on the render thread went away.

## Performance

Measured on the console, handheld, stock clocks, in a game. A game makes 300–650 draws a frame; three threads share
the work: the game thread (the recompiled game plus the recording of each draw), the render thread (the backend) and
the GPU.

| Step | Result |
|---|---|
| v0.1.0: MVP's "draw consumption" wait, every draw waits for the render thread | ~28 fps (30 cap) |
| `draw_copy`: the game thread copies each draw's vertices and does not wait | 46–57 fps (60 cap), render thread is the limit |
| deko3d | render thread 13–16 → 9–13 ms; GPU 9 → ~7 ms with the hazard barriers |
| Packed vertices drawn raw | 8–28 thousand vertices a frame no longer converted on the CPU |
| Texture binds and samplers remembered from the last draw; CPU-cached upload ring; sampled texture checks | render thread ~22 µs a draw |
| **State tracking:** every write to the render state marks its 64 byte blocks; each draw sends only those | title thread 13.5 → ~5 µs a draw |
| From the console profile: hashed caches in front of the header and resource maps, NEON index range | title thread busy 79% → 62% of the time |

Result (v0.2.0, stock clocks): median about 58 fps, 55 or more 94% of the time, 52–56 in the busiest scenes; a steady
60 with the CPU at 1785 MHz.

The console profile of the game thread at that point: recompiled game code ~32%, recording the draws ~22%, idle
~38%. The game's own code is spread thin (no function above 2%), so the remaining room is mostly in the recording.

Every 10 s the log writes `perf:` lines: fps, ms a frame per thread, GPU time, the render thread's phases, barriers,
texture checks and how many draws were converted on the CPU.

## Console overlays

`switch/overlays.cpp` talks to SaltyNX through the `SaltySD` port. It asks for the shared page (command 7), reserves
blocks if they are missing (command 6) and closes the session (command 0). Then it writes the `NxFpsSharedBlock` block
(FPS, frame times, resolution and the API) and reads ReverseNX-RT's block to follow the handheld/docked mode picked
there. Without SaltyNX it does nothing.

## Debugging tools

- **Scripted pad** (`game/src/common/pad_script.cpp`): `MVP05_PAD_SCRIPT=<file>` or a `cmd` file next to the
  executable, with `BUTTONS [s]`, `WAIT s` and `SHOT` steps. Works on Windows, Vulkan, deko3d and the Switch.
- **Console profiler** (`switch/profiler.cpp`, `profile = true`; adapted from R-drg's defjam-sw): a thread above the
  game's pauses each busy thread every millisecond, reads its pc, lr and return addresses, and writes 32 byte samples
  to `logs/prof.bin`. `tools/prof_report.py prof.bin build-switch/mvp05.elf mvp05.log` turns them into self and
  inclusive time per function, game code against runtime, and the callers of the hottest runtime functions.
- **Comparing D3D12 with Vulkan on the PC**: `tools/compare_run.ps1` follows `tools/compare_route.txt` and saves
  screenshots; `tools/compare_png.py` compares them.
- **Detailed log**: `VERBOSE=ON` when building writes every file read with its hash, for diffing between platforms.
- **deko3d shader tests**: `tools/dk_shaders` (PC: converts and compiles a shader cache) and `tools/dk_test` /
  `tools/nvk_test` (console: test pattern, uam on the console, GPU time per pixel shader on deko3d and NVK).
- **Ryujinx** is useful for testing starts, crashes and pictures, not for measuring performance. With the HOS version
  it reports without firmware, the clocks must stay at 0.

## Known issues

- Orange bands in the between-innings transition. The Windows port has them too.
- The first use of a new shader stutters once until it is cached.
