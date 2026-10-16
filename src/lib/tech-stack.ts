// Lo que cada miembro usa para trabajar y muestra en su perfil. Son listas cerradas (con un
// "otro") para que /estadisticas pueda contarlas; los ids se guardan en el usuario.

export type TechOption = { id: string; label: string };

export const OPERATING_SYSTEMS = [
  { id: 'windows', label: 'Windows' },
  { id: 'macos', label: 'macOS' },
  { id: 'ubuntu', label: 'Ubuntu' },
  { id: 'debian', label: 'Debian' },
  { id: 'fedora', label: 'Fedora' },
  { id: 'arch', label: 'Arch Linux' },
  { id: 'linux-mint', label: 'Linux Mint' },
  { id: 'pop-os', label: 'Pop!_OS' },
  { id: 'otro-linux', label: 'Otro Linux' },
  { id: 'chromeos', label: 'ChromeOS' },
  { id: 'bsd', label: 'BSD' },
] as const satisfies readonly TechOption[];

export const IDES = [
  { id: 'vscode', label: 'VS Code' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'windsurf', label: 'Windsurf' },
  { id: 'zed', label: 'Zed' },
  { id: 'intellij', label: 'IntelliJ IDEA' },
  { id: 'webstorm', label: 'WebStorm' },
  { id: 'pycharm', label: 'PyCharm' },
  { id: 'goland', label: 'GoLand' },
  { id: 'rider', label: 'Rider' },
  { id: 'visual-studio', label: 'Visual Studio' },
  { id: 'android-studio', label: 'Android Studio' },
  { id: 'xcode', label: 'Xcode' },
  { id: 'eclipse', label: 'Eclipse' },
  { id: 'neovim', label: 'Neovim' },
  { id: 'vim', label: 'Vim' },
  { id: 'emacs', label: 'Emacs' },
  { id: 'sublime', label: 'Sublime Text' },
  { id: 'otro', label: 'Otro' },
] as const satisfies readonly TechOption[];

const labels = (options: readonly TechOption[]) =>
  new Map(options.map((option) => [option.id, option.label]));

const osLabels = labels(OPERATING_SYSTEMS);

export const isOperatingSystem = (id: string) => osLabels.has(id);

/** Labels of the given OS ids, in catalog order, skipping unknown ones. */
export const operatingSystemLabels = (ids: readonly string[]) =>
  OPERATING_SYSTEMS.filter((os) => ids.includes(os.id)).map((os) => os.label);

const ideLabels = labels(IDES);

export const isIde = (id: string) => ideLabels.has(id);

export const ideLabel = (id: string | null | undefined) => (id && ideLabels.get(id)) || null;

// El resto del stack, en texto libre: una línea por categoría ("Ghostty", "MacBook Pro M3 14\"",
// "2× Dell 27\" 4K"). Se guarda en UserStackItem.
export const STACK_CATEGORIES = [
  {
    id: 'terminal',
    label: 'terminal',
    kind: 'software',
    placeholder: 'Ghostty, iTerm2, Windows Terminal…',
  },
  { id: 'shell', label: 'shell', kind: 'software', placeholder: 'zsh, fish, PowerShell…' },
  {
    id: 'db-client',
    label: 'gestor de BD',
    kind: 'software',
    placeholder: 'DBeaver, TablePlus, pgAdmin…',
  },
  { id: 'browser', label: 'navegador', kind: 'software', placeholder: 'Firefox, Chrome, Arc…' },
  {
    id: 'ai',
    label: 'asistente de IA',
    kind: 'software',
    placeholder: 'Claude, Copilot, ChatGPT…',
  },
  {
    id: 'notebook',
    label: 'notebook',
    kind: 'hardware',
    placeholder: 'MacBook Air M2, ThinkPad T14…',
  },
  { id: 'pc', label: 'PC', kind: 'hardware', placeholder: 'Ryzen 7 7800X3D, 32 GB, RTX 4070…' },
  { id: 'monitor', label: 'monitor', kind: 'hardware', placeholder: '2× Dell 27" 4K…' },
  {
    id: 'keyboard',
    label: 'teclado',
    kind: 'hardware',
    placeholder: 'Keychron K2, Logitech MX Keys…',
  },
  { id: 'mouse', label: 'mouse', kind: 'hardware', placeholder: 'Logitech MX Master 3S…' },
  { id: 'headphones', label: 'auriculares', kind: 'hardware', placeholder: 'Sony WH-1000XM5…' },
  { id: 'phone', label: 'celular', kind: 'hardware', placeholder: 'Pixel 8, iPhone 15…' },
] as const;

export type StackCategoryOption = (typeof STACK_CATEGORIES)[number];
export type StackCategory = StackCategoryOption['id'];

export const STACK_CATEGORY_IDS = STACK_CATEGORIES.map((category) => category.id) as [
  StackCategory,
  ...StackCategory[],
];

export const STACK_ITEM_MAX = 100;

/** The member's stack items in catalog order, with their category's label and kind. */
export const sortStackItems = (items: readonly { category: string; name: string }[]) =>
  STACK_CATEGORIES.flatMap((category) => {
    const item = items.find((candidate) => candidate.category === category.id);
    return item ? [{ ...category, name: item.name }] : [];
  });
