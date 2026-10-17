/**
 * Browser tab titles read like a line typed into a shell: `<command> <~/path>`, followed by the
 * ` · pcn` suffix the root layout's template adds. The command comes first so the distinctive
 * part survives a narrow tab: `ls ~/eventos` for listings, `cat ~/eventos/<slug>` for a detail
 * page, `vim …` for forms, `sudo …` for admin screens and a few classic Unix commands where one
 * fits (`man pcn` for the FAQ, `history`, `who`, `git log`).
 *
 * Only the tab title is terminal-style: OpenGraph and Twitter titles stay human-readable so
 * shared links still read well in chats and social cards.
 */

export const SITE_NAME = 'programaConNosotros';
export const TAB_TITLE_SUFFIX = ' · pcn';
/** Applied by the root layout to every page title (not to `{ absolute }` ones). */
export const TAB_TITLE_TEMPLATE = `%s${TAB_TITLE_SUFFIX}`;
/** The home and every page that doesn't set its own title: a bare prompt. */
export const HOME_TAB_TITLE = `${SITE_NAME}:~$`;
export const NOT_FOUND_TAB_TITLE = '404: command not found';
/** Detail pages whose record doesn't exist (anymore). */
export const MISSING_TAB_TITLE = '404: no such file or directory';
/** A page that crashed while rendering (`(platform)/error.tsx`). */
export const ERROR_TAB_TITLE = 'Segmentation fault (core dumped)';
/** The root layout itself crashed (`global-error.tsx`). */
export const FATAL_TAB_TITLE = 'Kernel panic - not syncing';
export const OFFLINE_TAB_TITLE = 'ping: network unreachable';

/** `Juan Pérez` → `juan-perez`, short enough to keep the tab readable. */
export const tabSlug = (text: string, max = 32) => {
  const slug = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= max) return slug || 'untitled';
  const cut = slug.slice(0, max);
  if (slug[max] === '-') return cut;
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > max / 2 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '');
};

const home = (path: string) => `~/${path}`;
const file = (dir: string, name: string) => `${home(dir)}/${tabSlug(name)}`;

export const tabTitle = {
  /** A listing: `ls ~/eventos`. */
  ls: (dir: string) => `ls ${home(dir)}`,
  /** A single record: `cat ~/eventos/pcn-meetup-5`. */
  cat: (dir: string, name: string) => `cat ${file(dir, name)}`,
  /** A photo or video: `open ~/galeria/<caption>`. */
  open: (dir: string, name: string) => `open ${file(dir, name)}`,
  /** A form that edits something: `vim ~/eventos/*\/editar`. */
  vim: (path: string) => `vim ${home(path)}`,
  /** A form that creates something: `touch ~/eventos/nuevo`. */
  touch: (path: string) => `touch ${home(path)}`,
  /** An admin-only listing: `sudo ls ~/usuarios`. */
  sudo: (dir: string) => `sudo ls ${home(dir)}`,
};

const withoutSuffix = (title: string) =>
  title.endsWith(TAB_TITLE_SUFFIX) ? title.slice(0, -TAB_TITLE_SUFFIX.length) : title;

/**
 * PCN OS's own tab title follows the focused window: its page's command with a ` · pcn-os`
 * suffix, or `cd ~/<program>` while the window hasn't loaded yet.
 */
export const osTabTitle = (windowTitle: string | null, programName: string) => {
  const command = windowTitle ? withoutSuffix(windowTitle) : `cd ~/${tabSlug(programName)}`;
  return command === HOME_TAB_TITLE ? 'pcn-os:~$' : `${command} · pcn-os`;
};

/**
 * What a tab title points at, for the PCN OS window title bar (which already shows the
 * program's `~/dir`): the last segment of a nested path (`cat ~/eventos/meetup` → `meetup`),
 * or null for a top-level listing or a plain command.
 */
export const tabTitleSubject = (title: string | null) => {
  if (!title) return null;
  const target = withoutSuffix(title).trim().split(/\s+/).at(-1) ?? '';
  if (!target.startsWith('~/')) return null;
  const segments = target.slice(2).split('/').filter(Boolean);
  return segments.length > 1 ? segments.at(-1)! : null;
};
