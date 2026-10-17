/** Every keyboard shortcut of the site, grouped by where it works, for the shortcuts dialog. */

export interface Shortcut {
  /** Keys pressed together or in sequence; `Mod` reads ⌘ on Apple devices and Ctrl elsewhere. */
  keys: string[];
  description: string;
}

export interface ShortcutGroup {
  id: string;
  title: string;
  /** Where the group applies, when it isn't everywhere. */
  scope?: string;
  shortcuts: Shortcut[];
}

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    id: 'general',
    title: 'General',
    shortcuts: [
      { keys: ['Mod', 'K'], description: 'Búsqueda global' },
      { keys: ['?'], description: 'Mostrar los atajos de teclado' },
      { keys: ['/'], description: 'Buscar en la página' },
      { keys: ['Esc'], description: 'Cerrar el diálogo o limpiar la búsqueda' },
      { keys: ['Mod', 'B'], description: 'Mostrar u ocultar la barra lateral' },
    ],
  },
  {
    id: 'vim',
    title: 'Navegación estilo vim',
    shortcuts: [
      { keys: ['j', 'k'], description: 'Bajar / subir' },
      { keys: ['h', 'l'], description: 'Atrás / adelante, como ← →' },
      { keys: ['d', 'u'], description: 'Media página abajo / arriba' },
      { keys: ['f', 'b'], description: 'Página completa abajo / arriba' },
      { keys: ['gg'], description: 'Ir al principio' },
      { keys: ['G'], description: 'Ir al final' },
      { keys: [']', '['], description: 'Sección siguiente / anterior del índice' },
      { keys: ['H', 'L'], description: 'Atrás / adelante en el historial' },
      { keys: ['yy'], description: 'Copiar el link de la página' },
    ],
  },
  {
    id: 'galeria',
    title: 'Galería',
    scope: 'en el detalle de una foto',
    shortcuts: [
      { keys: ['←', '→'], description: 'Foto anterior / siguiente' },
      { keys: ['Esc'], description: 'Volver a la grilla' },
    ],
  },
  {
    id: 'entrevistas',
    title: 'Simulador de entrevistas',
    scope: 'mientras respondés',
    shortcuts: [
      { keys: ['Espacio'], description: 'Mostrar la respuesta (también Enter)' },
      { keys: ['1', '2'], description: 'La sabía / no la sabía' },
    ],
  },
  {
    id: 'pcn-os',
    title: 'PCN OS',
    scope: 'en el escritorio',
    shortcuts: [
      {
        keys: ['Arrastrar', 'borde'],
        description: 'Llevar una ventana a una mitad del escritorio',
      },
      { keys: ['Arrastrar', 'arriba'], description: 'Maximizar la ventana' },
      { keys: ['Doble clic'], description: 'Maximizar o restaurar desde la barra de título' },
      { keys: ['Clic derecho'], description: 'En un link: abrirlo en una ventana nueva' },
      { keys: ['←', '→'], description: 'Mover la línea entre dos ventanas acopladas' },
    ],
  },
];

/** `Mod` → ⌘ on Apple devices, Ctrl elsewhere. */
export const keyLabel = (key: string, apple: boolean) =>
  key === 'Mod' ? (apple ? '⌘' : 'Ctrl') : key;

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Groups with only the shortcuts whose keys, description or group match the query. */
export const filterShortcuts = (groups: ShortcutGroup[], query: string) => {
  const needle = normalize(query.trim());
  if (!needle) return groups;
  return groups
    .map((group) => {
      if (normalize(group.title).includes(needle)) return group;
      return {
        ...group,
        shortcuts: group.shortcuts.filter((shortcut) =>
          normalize(`${shortcut.keys.join(' ')} ${shortcut.description}`).includes(needle),
        ),
      };
    })
    .filter((group) => group.shortcuts.length > 0);
};
