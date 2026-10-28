// Interface texts. Works in the page and in the worker (no DOM here). Static
// texts in index.html name their key with data-i18n (plain text) or
// data-i18n-html (our own text with markup). Adapted from defjam-sw-installer
// (R-drg), itself from the-simpsons-game-nx-installer and nfsmw-nx-installer
// by StevensND (GPL-3.0).

// English first: the page opens in English, Spanish is the second choice
export const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'es', name: 'Español', short: 'ES' },
];

const A = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const REPO = 'https://github.com/xsaja/mvp-nx';
const README_ES = `${REPO}#installation`;
const README_EN = `${REPO}#installation`;
const TGP = A('https://github.com/TGP482/XboxXBE-Recomp', 'XboxXBE-Recomp');
const MVP05 = A('https://github.com/maddog847/MVP-Baseball-2005-XBERecomp', 'MVP05 XBE Recomp');
const BLACKNX = A('https://github.com/gerisson1996/BLACK-NX-PORT', 'BLACK-NX-PORT');
const MESA = A('https://github.com/danfromtico/mesa-switch', 'mesa-switch');
const LIBNX = A('https://github.com/switchbrew/libnx', 'libnx');
const DKP = A('https://devkitpro.org', 'devkitPro');
const DEFJAM = A('https://github.com/R-drg/defjam-sw-installer', 'defjam-sw-installer');
const NFSMW = A('https://github.com/StevensND/nfsmw-nx-installer', 'nfsmw-nx-installer');

const TEXTS = {
  es: {
    lead:
      'Crea el paquete de <strong>Nintendo Switch</strong> de <strong>MVP Baseball 2005</strong> a partir de tu ' +
      'propia copia de <strong>Xbox original</strong>. Todo se hace en <strong>este navegador</strong>: tus archivos del juego nunca se suben.',
    languageBar: 'Idioma',
    installer: 'instalador',
    step1: '1. Elige tu juego',
    formatIso: 'Imagen de disco (.iso)',
    formatFolder: 'Carpeta del juego',
    formatHint:
      'Sirven tanto un volcado completo del disco como un xiso. Para la <strong>carpeta del juego</strong>, elige la ' +
      'carpeta que tiene <code>default.xbe</code> y la carpeta <code>data</code> del disco.',
    nothingChosen: 'Todavía no has elegido nada.',
    chosenFile: '{name} ({size})',
    chosenFolder: '{name}: {count} archivos ({size})',
    chosenFolderOne: '{name}: 1 archivo ({size})',
    step2: '2. Crea el paquete',
    step2First: 'Si lo instalas por primera vez:',
    create: 'Crear mvp-nx.zip',
    step2Update: 'Si ya lo tienes instalado y solo quieres la versión nueva (<code>mvp05.nro</code> y las licencias):',
    createUpdate: 'Crear mvp-nx-update.zip',
    step3: '3. Cópialo a la Switch',
    step3Extract: 'Descomprime el <code>.zip</code> dentro de <code>sdmc:/switch/</code>: queda <code>sdmc:/switch/mvp05/</code>.',
    step3Start:
      'Mantén <strong>R</strong> al abrir cualquier juego instalado para entrar en el <strong>Homebrew Menu</strong> ' +
      '(modo título: desde el Álbum no hay memoria suficiente) y abre <strong>MVP Baseball 2005</strong>. También vale ' +
      `sphaira o un forwarder. Los ajustes están en <code>mvp05-settings.toml</code>. Más en el ${A(README_ES, 'README')}.`,
    checking: 'Comprobando tu juego…',
    supported: 'Compatible: la copia con la que se probó el port',
    untested:
      'Es MVP Baseball 2005 (title ID 45410056), pero no la copia exacta con la que se probó el port. El juego la ' +
      'acepta, aunque puede fallar. Si falla, avisa con este código:',
    executableOnly:
      'Compatible, pero falta la carpeta data del disco: elige el juego completo para crear el paquete completo. El ' +
      'paquete de actualización solo necesita default.xbe.',
    notGame: 'Esto no parece MVP Baseball 2005 de Xbox original.',
    gameName: 'MVP Baseball 2005',
    notIso: 'No es una imagen de disco de Xbox',
    notComplete: 'No es un juego completo',
    noExecutable: 'No se encontró default.xbe: elige la imagen de disco, o la carpeta que tiene default.xbe y la carpeta data.',
    incomplete: 'No se encontró la carpeta data del disco: elige el juego completo (la imagen de disco, o la carpeta con default.xbe y data).',
    notSupported: 'esta copia no es MVP Baseball 2005 para Xbox (código {hash}).',
    downloadingBuild: 'Descargando mvp05.nro…',
    downloadFailed: 'no se pudo descargar {url} (HTTP {status}). Revisa tu conexión e inténtalo de nuevo.',
    buildMismatch: 'el programa descargado no es el esperado. Recarga la página e inténtalo de nuevo.',
    logRelease: 'Tu copia: MVP Baseball 2005, {edition}.',
    logUpdate: 'Paquete de actualización: no se tocan los archivos del juego ni tus ajustes.',
    readingFiles: 'Leyendo tu juego…',
    copied: 'Copiado {path}',
    done: 'Paquete completo.',
    noStreaming: 'esta ventana del navegador no puede guardar descargas grandes. Usa una ventana normal (no privada) de Chrome, Edge o Firefox.',
    downloadStarted: 'Descarga iniciada ({size}). No cierres esta página hasta que termine.',
    finished: 'Terminado en {seconds} s.',
    error: 'Error: {message}',
    cancelled: 'se canceló la descarga',
    sourceCode: 'Código fuente',
    installerSource: 'Código del instalador',
    credits:
      `Port para Switch: xsaja. Hecho sobre ${MVP05} de maddog847, el recompilador ${TGP} de TGP482 y la capa ` +
      `de Switch de ${BLACKNX} (gerisson1996). Funciona con ${LIBNX}, ${DKP}, deko3d y NVK (${MESA}). Esta página está ` +
      `adaptada de ${DEFJAM} (R-drg), que a su vez viene de ${NFSMW} de StevensND.`,
    legal:
      'MVP Baseball 2005 © 2005 Electronic Arts Inc. MLB y sus marcas pertenecen a sus dueños. mvp-nx es un proyecto no oficial hecho por aficionados, sin relación con Electronic Arts, Major League Baseball, la MLBPA, Nintendo ni Microsoft. Nintendo Switch es una marca de Nintendo; Xbox es una marca de Microsoft. Este sitio no aloja ni reparte imágenes de disco ni datos del juego: tu imagen o carpeta se lee solo dentro de tu navegador, nunca se sube, y sus archivos se copian directamente al zip que se guarda en tu ordenador. Necesitas tu propia copia del juego, obtenida legalmente. La portada pertenece a sus dueños.',
  },
  en: {
    lead:
      'Builds the <strong>Nintendo Switch</strong> package of <strong>MVP Baseball 2005</strong> from your own ' +
      '<strong>original Xbox</strong> copy. Everything runs in <strong>this browser</strong>: your game files are never uploaded.',
    languageBar: 'Language',
    installer: 'installer',
    step1: '1. Choose your game',
    formatIso: 'Disc image (.iso)',
    formatFolder: 'Game folder',
    formatHint:
      'A full disc dump or an xiso both work. For the <strong>game folder</strong>, select the folder that contains ' +
      '<code>default.xbe</code> and the disc\'s <code>data</code> folder.',
    nothingChosen: 'Nothing chosen yet.',
    chosenFile: '{name} ({size})',
    chosenFolder: '{name}: {count} files ({size})',
    chosenFolderOne: '{name}: 1 file ({size})',
    step2: '2. Create the package',
    step2First: 'Installing for the first time:',
    create: 'Create mvp-nx.zip',
    step2Update: 'Already installed, and you only want the new version (<code>mvp05.nro</code> and the licences):',
    createUpdate: 'Create mvp-nx-update.zip',
    step3: '3. Copy it to the Switch',
    step3Extract: 'Extract the downloaded <code>.zip</code> into <code>sdmc:/switch/</code>: you get <code>sdmc:/switch/mvp05/</code>.',
    step3Start:
      'Hold <strong>R</strong> while starting any installed game to open the <strong>Homebrew Menu</strong> (title ' +
      'takeover: the Album does not have enough memory), then start <strong>MVP Baseball 2005</strong>. sphaira or a ' +
      `forwarder work too. Settings are in <code>mvp05-settings.toml</code>. More in the ${A(README_EN, 'README')}.`,
    checking: 'Checking your game…',
    supported: 'Supported: the copy the port was tested with',
    untested:
      'This is MVP Baseball 2005 (title ID 45410056), but not the exact copy the port was tested with. The game ' +
      'accepts it, but it may fail. If it does, report it with this code:',
    executableOnly:
      'Supported, but the disc\'s data folder is missing: choose the whole game to create the full package. The ' +
      'update package only needs default.xbe.',
    notGame: 'This does not look like MVP Baseball 2005 for the original Xbox.',
    gameName: 'MVP Baseball 2005',
    notIso: 'Not an Xbox disc image',
    notComplete: 'Not a complete game',
    noExecutable: 'default.xbe was not found: choose the disc image, or the folder that contains default.xbe and the data folder.',
    incomplete: 'The disc\'s data folder was not found: choose the whole game (the disc image, or the folder with default.xbe and data).',
    notSupported: 'this copy is not MVP Baseball 2005 for the Xbox (code {hash}).',
    downloadingBuild: 'Downloading mvp05.nro…',
    downloadFailed: 'could not download {url} (HTTP {status}). Check your connection and try again.',
    buildMismatch: 'the downloaded program is not the expected one. Reload the page and try again.',
    logRelease: 'Your copy: MVP Baseball 2005, {edition}.',
    logUpdate: 'Update package: the game files and your settings are not touched.',
    readingFiles: 'Reading your game…',
    copied: 'Copied {path}',
    done: 'Package complete.',
    noStreaming: 'this browser window cannot save large downloads. Use a normal (not private) window of Chrome, Edge or Firefox.',
    downloadStarted: 'Download started ({size}). Keep this page open until it finishes.',
    finished: 'Finished in {seconds} s.',
    error: 'Error: {message}',
    cancelled: 'the download was cancelled',
    sourceCode: 'Source code',
    installerSource: 'Installer source',
    credits:
      `Switch port by xsaja. Built on maddog847's ${MVP05}, TGP482's ${TGP} recompiler and the Switch layer of ` +
      `${BLACKNX} (gerisson1996). Runs on ${LIBNX}, ${DKP}, deko3d and NVK (${MESA}). This page is adapted from ${DEFJAM} ` +
      `(R-drg), itself from ${NFSMW} by StevensND.`,
    legal:
      'MVP Baseball 2005 © 2005 Electronic Arts Inc. MLB and its marks belong to their respective owners. mvp-nx is an unofficial fan project and is not affiliated with, endorsed or sponsored by Electronic Arts, Major League Baseball, the MLBPA, Nintendo or Microsoft. Nintendo Switch is a trademark of Nintendo; Xbox is a trademark of Microsoft. This site does not host or distribute disc images or game data: your disc image or game folder is read only inside your browser, is never uploaded, and its files are copied straight into the zip saved on your computer. You need your own legally obtained copy of the game. The cover art belongs to its respective owners.',
  },
};

let current = 'en';

export function setLanguage(code) {
  current = TEXTS[code] ? code : 'en';
}

export function getLanguage() {
  return current;
}

// The saved choice, else English.
export function preferredLanguage(saved) {
  return saved && TEXTS[saved] ? saved : 'en';
}

export function t(key, vars = {}) {
  const text = (TEXTS[current] && TEXTS[current][key]) ?? TEXTS.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

export function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

export const KEYS = Object.keys(TEXTS.en);
export const ALL_TEXTS = TEXTS;
