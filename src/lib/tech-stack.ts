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

const labels = (options: readonly TechOption[]) =>
  new Map(options.map((option) => [option.id, option.label]));

const osLabels = labels(OPERATING_SYSTEMS);

export const isOperatingSystem = (id: string) => osLabels.has(id);

/** Labels of the given OS ids, in catalog order, skipping unknown ones. */
export const operatingSystemLabels = (ids: readonly string[]) =>
  OPERATING_SYSTEMS.filter((os) => ids.includes(os.id)).map((os) => os.label);
