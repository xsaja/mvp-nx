<h1 align="center">mvp-nx</h1>

<p align="center">
  <b>MVP Baseball 2005</b> (Xbox, 2005) en <b>Nintendo Switch</b>,<br>
  recompilado de forma estática a partir del ejecutable original de Xbox. No es un emulador.
</p>

<p align="center">
  <a href="https://xsaja.github.io/mvp-nx/"><b>Instalador</b></a> ·
  <a href="https://github.com/xsaja/mvp-nx/releases"><b>Releases</b></a> ·
  <a href="#créditos"><b>Créditos</b></a> ·
  🇺🇸 <a href="README.en.md"><b>English</b></a>
</p>

El código x86 del juego se traduce a C++ y se compila como un programa nativo de Switch, con un runtime que sustituye
al kernel de la Xbox, a su Direct3D 8 (sobre Vulkan/NVK) y a su audio. Parte del port de Windows
**MVP05 XBE Recomp** de maddog847, del recompilador **[XboxXBE-Recomp](https://github.com/TGP482/XboxXBE-Recomp)** de
TGP482 y de la capa de Switch de **[BLACK-NX-PORT](https://github.com/gerisson1996/BLACK-NX-PORT)**.

> [!IMPORTANT]
> **No incluye ningún dato del juego.** Necesitas tu propia copia de *MVP Baseball 2005* para Xbox original
> (title ID `45410056`).

## Qué funciona

- Arranque, vídeos, menús, música y sonido.
- Partidos de exhibición completos, probados en consola.
- Límite de 60 fps por defecto: con deko3d, en portátil, el partido va casi siempre a 57–60 fps (53–56 en las
  escenas más cargadas, 60 fijos con la CPU a 1785 MHz). Con `fps_cap = 30`, 30 fps totalmente estables.
- 1280×720 en portátil y 1920×1080 en la base, con cambio automático.
- Hasta 4 mandos, con vibración.
- FPS y resolución en Status Monitor / Horizon OC Monitor, y modo portátil/base con ReverseNX-RT (necesitan SaltyNX).

No se ha jugado todo. Si algo falla, avisa con el log (ver [Problemas](#problemas)).

## Instalación

Necesitas una Switch con **Atmosphère** y tu copia del juego: la imagen del disco (`.iso`, volcado completo o xiso) o
el disco extraído (la carpeta con `default.xbe`).

1. Abre el **[instalador](https://xsaja.github.io/mvp-nx/)** en Chrome, Edge o Firefox desde un ordenador. Elige tu
   imagen de disco o la carpeta del juego. La página comprueba que es el juego correcto y guarda **`mvp-nx.zip`**.
   Todo pasa dentro de tu navegador: tus archivos nunca se suben.
2. Descomprime el zip en la carpeta **`switch`** de la microSD. Queda así:
   ```
   sdmc:/switch/mvp05/
   ├── mvp05.nro             el juego
   ├── mvp05-settings.toml   los ajustes
   ├── LICENSES.txt
   └── game/                 los archivos de tu disco (default.xbe, data/, ...)
   ```
3. En la Switch, mantén **R** al abrir cualquier juego instalado para entrar en el Homebrew Menu en **modo título** y
   abre **MVP Baseball 2005**. También vale abrirlo desde sphaira o con un forwarder. Desde el Álbum (modo applet) no
   hay memoria suficiente.

Las partidas se guardan en `sdmc:/switch/mvp05/hdd/`.

<details>
<summary>Instalarlo a mano</summary>

Descarga `mvp05.nro`, `mvp05-settings.toml` y `LICENSES.txt` del
[último release](https://github.com/xsaja/mvp-nx/releases/latest) en `sdmc:/switch/mvp05/`. Después copia todos los
archivos del disco en `sdmc:/switch/mvp05/game/`, o pon ahí la `.iso`. Si puedes, copia con un lector de tarjetas: algunas
herramientas MTP se saltan carpetas sin avisar.
</details>

## Controles

A/B/X/Y van **por posición**, como en un mando de Xbox, que es como MVP lanza a las bases (en los menús se acepta
con B, el botón de abajo):

| Switch | Xbox | En defensa |
|---|---|---|
| B (abajo) | A | home |
| A (derecha) | B | primera |
| X (arriba) | Y | segunda |
| Y (izquierda) | X | tercera |
| L / R | gatillos L / R (los que muestra el juego) | |
| ZL / ZR | blanco / negro | |
| + / − | Start / Back | |

Con `buttons_by_name = true` en los ajustes, A/B/X/Y van por letra (A de Switch = A de Xbox).

## Ajustes

Están en `mvp05-settings.toml`, junto al NRO, explicados dentro del propio archivo. Los más útiles:

| Ajuste | Qué hace |
|---|---|
| `fps_cap = 30` | 30 fps totalmente estables, en vez del límite de 60. |
| `renderer = "vulkan"` | Vuelve al motor gráfico Vulkan (NVK) en vez de deko3d, si algo se ve mal. |
| `render_percent = 75` | Resolución interna más baja, por si va lento. |
| `cpu_mhz`, `gpu_mhz`, `mem_mhz` | Sube los relojes mientras se juega (topes oficiales: 1785, 921, 1600). Déjalos en 0 si usas Horizon OC o sys-clk. |
| `buttons_by_name = true` | Botones por letra en vez de por posición. |
| `saltynx = false` | Desactiva la conexión con los overlays. |

## Problemas

- El juego escribe `sdmc:/switch/mvp05/logs/mvp05.log`. Si se cierra con un error, adjunta también el informe de
  `sdmc:/atmosphere/crash_reports/` en un [issue](https://github.com/xsaja/mvp-nx/issues), y cuenta qué estabas haciendo.
- **Franjas naranjas** en la transición de fin de entrada: también pasan en el port de Windows.
- La primera vez que aparece un efecto puede haber un tirón mientras se compila su shader; después queda en la caché.
- En la base, Ultrahand no abre si el "tamaño de pantalla" de la consola está al 96 %: ponlo al 100 %.
- No hay juego en red.

## Compilar desde el código

<details>
<summary>Windows (PC) y Nintendo Switch</summary>

Todo se hace en Windows.

1. **Herramientas:** Visual Studio 2026 con C++ y su componente Clang, CMake, Ninja y Python 3. Para la Switch: MSYS2
   con [devkitPro](https://devkitpro.org/wiki/Getting_Started) (`switch-dev`, `switch-zlib`, `switch-libzstd`,
   `switch-libexpat`).
2. **NVK:** compila [mesa-switch](https://github.com/danfromtico/mesa-switch) como librerías estáticas, o usa un SDK
   ya compilado, y haz que `nvk_sdk/` apunte a su carpeta `opt/devkitpro/portlibs/switch`.
3. **El juego:** pon tu `default.xbe` y sus carpetas en `game/assets/`. Nunca subas esos archivos ni `game/generated/`.
4. **Recompilar:** `tools\build_pc.cmd` compila el recompilador, traduce el xbe a `game/generated/game/` y crea
   `MVP05-vk.exe` y `MVP05-d3d12.exe` para probar en PC.
5. **El NRO:** en la terminal de MSYS2, `JOBS=8 switch/build.sh` → `build-switch/mvp05.nro`. Con `VERBOSE=ON` el log
   sale detallado. Si existe `switch/icon.jpg` (256×256), se usa como icono.
6. **Paquete para la SD:** `tools\package_switch.ps1` → `switch_sd/switch/mvp05/`. Si cambia alguna licencia, ejecuta
   antes `python tools/make_licenses.py`.

El instalador web está en `installer/`. Para probarlo en local: copia `mvp05.nro`, `LICENSES.txt` y
`switch/mvp05-settings.toml` en `installer/release/` y ejecuta `python installer/serve.py 8194 installer`.
</details>

## Cómo está hecho

[docs/notas-tecnicas.md](docs/notas-tecnicas.md) explica las bases del port, los arreglos de MVP que se conservan, los
fallos encontrados (y cómo), el trabajo de rendimiento y las herramientas de depuración.

| Ruta | Qué es |
|---|---|
| `switch/` | Capa de Switch: arranque, ajustes, log, deko3d y Vulkan/NVK, audio, mandos, relojes, overlays |
| `sdk/` | SDK de recompilación (de MVP y TGP482) con los parches para Switch |
| `game/` | Configuración del recompilador y código propio del juego (hooks, mando por guion) |
| `pc/` | Versiones de Windows para comparar Vulkan con D3D12 |
| `installer/` | La página del instalador |
| `tools/` | Compilación, paquete, licencias y comparación de capturas |

## Créditos

- **MVP05 XBE Recomp / Title-ID Update:** maddog847.
- **[XboxXBE-Recomp](https://github.com/TGP482/XboxXBE-Recomp)** (el recompilador y el SDK): TGP482.
- **[BLACK-NX-PORT](https://github.com/gerisson1996/BLACK-NX-PORT)** (la base de la capa de Switch): gerisson1996.
- **[Black-Android](https://github.com/RanggaCasper/Black-Android)** (el backend Vulkan del que parte este): RanggaCasper.
- **NVK:**
  - [mesa-switch](https://github.com/danfromtico/mesa-switch), de danfromtico.
  - La build de Mesa 26.2.4, de NaGaa95, compartida por StevensND.
  - Los autores de Mesa.
- **Overlays:** [SaltyNX](https://github.com/masagrator/SaltyNX), de masagrator y shinyquagsire23. La guía de overlays de
  [NFSMW-NX](https://github.com/StevensND/nfsmw-nx), de StevensND.
- **Instalador:** adaptado de [defjam-sw-installer](https://github.com/R-drg/defjam-sw-installer), de R-drg, que a su
  vez viene de [nfsmw-nx-installer](https://github.com/StevensND/nfsmw-nx-installer), de StevensND.
- **Librerías:**
  - [libnx](https://github.com/switchbrew/libnx) y [devkitPro](https://devkitpro.org).
  - glslang, Dear ImGui, toml++, SDL, Zydis, zstd, expat y zlib.

## Licencia

El código de este repositorio se publica bajo la **GPL-3.0** ([LICENSE](LICENSE)). Las partes de terceros conservan su
propia licencia; [LICENSES.txt](LICENSES.txt) las recoge todas.

<sub>MVP Baseball 2005 © 2005 Electronic Arts Inc. Este es un proyecto no oficial hecho por aficionados, sin relación
con Electronic Arts, Major League Baseball, la MLBPA, Microsoft ni Nintendo. El NRO lleva código traducido del
ejecutable del juego, pero ningún dato del juego: necesitas tu propia copia, obtenida legalmente.</sub>
