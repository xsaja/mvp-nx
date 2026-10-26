# Notas técnicas del port

Cómo está hecho mvp-nx, qué se cambió respecto a sus bases y qué fallos se encontraron. Sirve para quien quiera
compilarlo, arreglar algo o portar otro juego del mismo SDK.

## De dónde sale

| Base | Qué aporta |
|---|---|
| **MVP05 XBE Recomp, Title-ID Update** (maddog847) | El port de Windows: `config/game.toml`, `src/`, y el SDK con los arreglos propios de MVP |
| **XboxXBE-Recomp** (TGP482) | El recompilador `xbe_recomp` y el runtime: kernel de Xbox, Direct3D 8, DirectSound, XAPI |
| **BLACK-NX-PORT** (gerisson1996) | La capa de Switch (`switch/`) y los parches del SDK para Switch (memoria, archivos, hilos) |
| **Black-Android** (RanggaCasper) | El backend Vulkan del que parte `switch/vulkan.cpp` |
| **mesa-switch** (danfromtico; build 26.2.4 de NaGaa95) | NVK, el driver Vulkan enlazado de forma estática en el NRO |

El código x86 del `default.xbe` se traduce a C++ (`game/generated/game`, 128 particiones, nunca en git) y se compila
para ARM64 con devkitA64. El kernel y las librerías del XDK están implementados a nivel de API.

## Estructura

| Carpeta | Contenido |
|---|---|
| `sdk/` | El SDK de MVP con los parches de Switch, siempre detrás de `#ifdef __SWITCH__` para que el build de Windows siga compilando |
| `game/` | `config/game.toml`, `src/` (información del juego, hooks, mando por guion) y los ajustes de Windows |
| `switch/` | Capa de Switch: `main.cpp` (bucle del applet, ajustes, log, fallos), `vulkan.cpp`, `audio.cpp` (audren), `input.cpp` (HID), `game_files.cpp`, `clocks.cpp`, `overlays.cpp` (SaltyNX), CMake |
| `pc/` | `MVP05-vk.exe` y `MVP05-d3d12.exe`: el host de Windows de MVP con el backend Vulkan de Switch o con D3D12, para comparar en PC |
| `installer/` | La página que crea el paquete para la SD a partir de la copia del jugador |
| `tools/` | Compilación en PC, paquete para la SD, licencias, comparación de capturas |
| `third_party/` | glslang (con HLSL), Dear ImGui, toml++, Vulkan-Headers, SDL3 y Zydis (solo PC y recompilador) |

## Arreglos de MVP que se conservan

MVP trae arreglos propios sobre el SDK de TGP482. Black no los tiene, así que se mantuvieron los archivos de MVP:

- `xdk/d3d8.cpp`: recorrer el push buffer antes de `SetTexture`, la paleta y `SetVertexShader`; viewport nulo; arrays
  inline (`NV097_INLINE_ARRAY`) acumulados entre paquetes.
- `xdk/dsound.cpp`: `SetEG` aceptado; mixbins por defecto para 4 y 6 canales, todo mezclado a estéreo.
- `gpu/render_thread.cpp`: la espera "draw consumption" tras cada draw (ver rendimiento).
- `kernel/xboxkrnl.cpp`: AV pack HDTV y flag de 720p cuando `xbox_720p` está activado; `XC_AUDIO_FLAGS`.
- Del renderer D3D12 de MVP, llevado a Vulkan: `PixelBoundary` con escala X/Y separada, `MipLODBias` limitado, lectura
  de render targets medio texel atrás, escala de puntos y la captura F12.
- El `cbuffer` de constantes de MVP no tiene `rtshift`: el backend de Black se adaptó a eso.

## Fallos encontrados

- **Lecturas de archivo de más de 1 MB escribían de más** (`sdk/runtime/kernel/files.cpp`, heredado de
  BLACK-NX-PORT). En Switch las lecturas pasan por un búfer intermedio de 1 MB, porque el IPC del FS rechaza la code
  memory. El trozo se calculaba como `min(len, 1 MB)` en vez de `min(len - n, 1 MB)`, así que una lectura de 3,05 MB
  escribía 3,15 MB y pisaba la memoria contigua. En MVP rompía una lista del pool de memoria al cargar `anims.big`: el
  juego se cerraba a los 7 s de arrancar. Se encontró comparando, línea por línea, el log de E/S de Windows con el de
  Ryujinx.
- **Error al cerrar el programa** (2345-0008, libnx NotInitialized). `kernel::Shutdown` termina con `_Exit`, y libnx
  cierra HID mientras el hilo de mandos del juego sigue llamando a `padUpdate`. Ahora `input::Stop()` toma el cerrojo
  de input y desactiva HID antes de salir.
- **`xbox_720p` debe ser `true`**, como en el paquete de Windows de MVP.

## Rendimiento

Medido en consola, en portátil, durante un partido, con unos 380 draws por frame:

| Cambio | Resultado |
|---|---|
| Original: la espera "draw consumption" de MVP, cada draw espera al hilo de render | ~28 fps con límite de 30, el juego espera 15–19 ms por frame |
| `draw_copy`: el hilo del juego copia los vértices de cada draw al grabarlo y no espera | 30 fps fijos con límite de 30; 46–57 fps con límite de 60 |
| `reuse_constants`: reutiliza las constantes iguales a las del draw anterior | ~1 % |
| CPU a 1785 MHz | casi nada |

- La GPU tarda unos 6 ms por frame, igual a 720p que a 1080p. El límite es el hilo de render (~38 µs por draw).
- Por frame, ese hilo reparte así su tiempo: ensamblar vértices 4,2 ms · shaders y destinos 3,0 · subir datos 2,4 ·
  grabar comandos 2,0 · descriptores 1,3 · present 1,2 ms.
- Cada 10 s el log escribe tres líneas `perf:` con fps, ms por frame por hilo, GPU y el reparto anterior.
- Siguiente paso posible: un backend deko3d en lugar de NVK. Quitaría el coste del driver (~5–6 ms del hilo de
  render). Los shaders del SDK (2 bloques de constantes, hasta 4 texturas con registro fijo) encajan con uam.

## Overlays de la consola

`switch/overlays.cpp` habla con SaltyNX por el puerto `SaltySD`. Pide la página compartida (comando 7), reserva
bloques si faltan (comando 6) y cierra la sesión (comando 0). Después escribe el bloque `NxFpsSharedBlock` (FPS,
tiempos entre frames, resolución y `api = 3`, Vulkan) y lee el bloque de ReverseNX-RT para obedecer el modo
portátil/base elegido. Sin SaltyNX no hace nada.

## Herramientas para depurar

- **Mando por guion** (`game/src/common/pad_script.cpp`): `MVP05_PAD_SCRIPT=<archivo>` o un archivo `cmd` junto al
  ejecutable, con pasos `BOTONES [s]`, `WAIT s` y `SHOT`. Sirve en Windows, en Vulkan y en Switch.
- **Comparar D3D12 con Vulkan en PC**: `tools/compare_run.ps1` sigue `tools/compare_route.txt` y guarda capturas;
  `tools/compare_png.py` las compara.
- **Log detallado**: `VERBOSE=ON` al compilar escribe cada lectura de archivo con su hash, para hacer `diff` entre
  plataformas.
- **Ryujinx** sirve para probar arranques y fallos, no para medir rendimiento. Con la versión de HOS que informa sin
  firmware, los relojes deben quedarse en 0.

## Problemas conocidos

- Franjas naranjas en la transición de fin de entrada. También salen en el port de Windows.
- El primer uso de cada shader produce un pequeño tirón hasta que queda en la caché.
