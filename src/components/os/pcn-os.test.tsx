import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@/test/dom';
import { openGlobalSearch } from '@/components/search/global-search';
import { radios } from '@/components/music/music-sets';
import { MODE_ATTR } from './os-display-mode-script';
import { OS_MESSAGE_SOURCE } from './os-env';
import { SESSION_KEY } from './os-session';
import { PcnOs } from './pcn-os';

// The bell polls its own endpoint; its behaviour is covered in notification-center.test.tsx.
jest.mock('@/components/notifications/notification-center', () => ({
  NotificationCenter: () => null,
}));
jest.mock('@/actions/auth/sign-out', () => ({ signOut: jest.fn() }));

const mockSearchNavigate: { current: ((_path: string) => void) | null } = { current: null };
jest.mock('@/components/search/global-search', () => ({
  openGlobalSearch: jest.fn(),
  useSearchShortcutLabel: () => 'Ctrl K',
  GlobalSearch: ({ onNavigate }: { onNavigate: (_path: string) => void }) => {
    mockSearchNavigate.current = onNavigate;
    return null;
  },
}));

// The heavy desktop parts: the real windows, dock and launcher; light stand-ins for the
// decorative widgets (tested on their own).
jest.mock('./os-desktop-parts', () => ({
  AnimatePresence: jest.requireActual('motion/react').AnimatePresence,
  OsDock: jest.requireActual('./os-dock').OsDock,
  OsLauncher: jest.requireActual('./os-launcher').OsLauncher,
  OsWindow: jest.requireActual('./os-window').OsWindow,
  OsProcesses: ({ covered }: { covered: boolean }) => (
    <div data-testid="processes" data-covered={covered} />
  ),
  OsPhotos: ({ onOpen }: { onOpen: (_path: string) => void }) => (
    <button type="button" onClick={() => onOpen('/galeria/p1')}>
      foto
    </button>
  ),
  OsPerformanceNotice: () => null,
  BackgroundMusicPlayer: ({ set, open }: { set: { title: string }; open: boolean }) => (
    <div data-testid="music" data-open={open}>
      {set.title}
    </div>
  ),
}));

// jsdom has no PointerEvent: without it fireEvent.pointerDown drops `button` and coordinates.
beforeAll(() => {
  if (!('PointerEvent' in window))
    Object.defineProperty(window, 'PointerEvent', { configurable: true, value: MouseEvent });
});

const originalMatchMedia = window.matchMedia;
const root = document.documentElement;

const setScreen = (w: number, h = 900) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: h });
};

beforeEach(() => {
  window.matchMedia = ((query: string) => ({
    matches: query === '(min-width: 1024px)',
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
  setScreen(1100);
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  sessionStorage.clear();
  localStorage.clear();
  root.removeAttribute(MODE_ATTR);
  window.history.replaceState(null, '', '/');
});

const windows = () => screen.queryAllByRole('dialog').filter((el) => el.tagName === 'SECTION');
const windowNamed = (name: string) =>
  windows().find((el) => el.getAttribute('aria-label') === name)!;
const focusedWindow = () => windows().find((el) => el.dataset.focused === 'true');
const dock = () => screen.getByRole('navigation', { name: 'Dock' });

const renderOs = async (props: Partial<React.ComponentProps<typeof PcnOs>> = {}) => {
  const utils = render(<PcnOs user={null} isAdmin={false} {...props} />);
  await screen.findByRole('navigation', { name: 'Dock' });
  return utils;
};

const postFrom = (name: string, data: Record<string, unknown>, origin = window.location.origin) => {
  const iframe = within(windowNamed(name)).getByTitle(name) as HTMLIFrameElement;
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { source: OS_MESSAGE_SOURCE, ...data },
        origin,
        source: iframe.contentWindow,
      }),
    );
  });
  return iframe;
};

describe('PcnOs', () => {
  it('renders only the menu bar and wallpaper outside the desktop', () => {
    window.matchMedia = originalMatchMedia;
    render(<PcnOs user={null} isAdmin={false} />);
    expect(screen.getByText('PCN_OS')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Dock' })).not.toBeInTheDocument();
    expect(windows()).toHaveLength(0);
  });

  it('opens the landing page in a window and mirrors it in the address bar and tab', async () => {
    window.history.replaceState(null, '', '/eventos?x=1');
    await renderOs();
    expect(windows()).toHaveLength(1);
    const win = windowNamed('Eventos');
    expect(within(win).getByTitle('Eventos')).toHaveAttribute('src', '/eventos?x=1');
    expect(document.title).toBe('cd ~/eventos · pcn-os');
    expect(screen.getByText('~/eventos', { selector: 'header > span' })).toBeInTheDocument();
    expect(dock()).toHaveTextContent('01 proc');
  });

  it('opens the home next to the feed on a wide screen, home in front', async () => {
    setScreen(1600);
    await renderOs();
    expect(windows().map((w) => w.getAttribute('aria-label'))).toEqual(['Feed', 'Inicio']);
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Inicio');
    expect(window.location.pathname).toBe('/');
  });

  it('opens only the home in PCN OS liviano', async () => {
    setScreen(1600);
    root.setAttribute(MODE_ATTR, 'lite');
    await renderOs();
    expect(windows().map((w) => w.getAttribute('aria-label'))).toEqual(['Inicio']);
    expect(screen.queryByTestId('processes')).not.toBeInTheDocument();
  });

  it('focuses a running program from the dock, or opens it in a new window', async () => {
    setScreen(1600);
    await renderOs();
    await userEvent.click(within(dock()).getByRole('button', { name: 'Feed' }));
    expect(windows()).toHaveLength(2);
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Feed');
    expect(window.location.pathname).toBe('/feed');

    const other = within(dock())
      .getAllByRole('button')
      .find((b) => !['Inicio', 'Feed', 'Programas'].includes(b.getAttribute('aria-label')!))!;
    await userEvent.click(other);
    expect(windows()).toHaveLength(3);
    expect(focusedWindow()).toHaveAttribute('aria-label', other.getAttribute('aria-label'));
  });

  it('opens programs from the launcher', async () => {
    await renderOs();
    await userEvent.click(within(dock()).getByRole('button', { name: 'Programas' }));
    const launcher = screen.getByRole('dialog', { name: 'Todos los programas' });
    await userEvent.click(within(launcher).getByRole('button', { name: 'Feed' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Todos los programas' })).not.toBeInTheDocument(),
    );
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Feed');

    await userEvent.click(within(dock()).getByRole('button', { name: 'Programas' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salir' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Todos los programas' })).not.toBeInTheDocument(),
    );
  });

  it('minimizes, restores, maximizes and closes windows', async () => {
    await renderOs();
    const win = windowNamed('Inicio');
    expect(screen.getByTestId('processes')).toHaveAttribute('data-covered', 'false');

    await userEvent.click(within(win).getByRole('button', { name: 'Maximizar' }));
    expect(screen.getByTestId('processes')).toHaveAttribute('data-covered', 'true');
    expect(win).toHaveStyle({ left: '0px', top: '28px', width: '1100px' });
    await userEvent.click(within(win).getByRole('button', { name: 'Restaurar' }));
    expect(screen.getByTestId('processes')).toHaveAttribute('data-covered', 'false');

    await userEvent.click(within(win).getByRole('button', { name: 'Minimizar' }));
    expect(focusedWindow()).toBeUndefined();
    await userEvent.click(within(dock()).getByRole('button', { name: 'Inicio' }));
    expect(focusedWindow()).toBe(win);

    // Clicking the wallpaper hides every window.
    fireEvent.pointerDown(document.querySelector('.bg-\\[\\#020504\\]')!);
    expect(focusedWindow()).toBeUndefined();

    await userEvent.click(within(win).getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(windows()).toHaveLength(0));
    expect(screen.getByText(/abrí un programa desde el dock/)).toBeInTheDocument();
  });

  it('brings a window to the front when clicked', async () => {
    await renderOs();
    await userEvent.click(within(dock()).getByRole('button', { name: 'Feed' }));
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Feed');
    fireEvent.pointerDown(within(windowNamed('Inicio')).getByTitle('Inicio'));
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Inicio');
    // Already in front: nothing changes.
    fireEvent.pointerDown(within(windowNamed('Inicio')).getByTitle('Inicio'));
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Inicio');
  });

  it('moves and resizes windows inside the desktop, shielding the iframes meanwhile', async () => {
    const { container } = await renderOs();
    const win = windowNamed('Inicio');
    const header = win.querySelector('header')!;
    const shield = () => container.querySelector('[style*="cursor"]');

    fireEvent.pointerDown(header, { button: 0, clientX: 500, clientY: 40 });
    expect(shield()).toHaveStyle({ cursor: 'default' });
    act(() => {
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 5000, clientY: -500 }));
      window.dispatchEvent(new MouseEvent('pointerup'));
    });
    expect(shield()).toBeNull();
    // Slid back inside: right edge on the screen, top under the menu bar.
    const width = parseFloat(win.style.width);
    expect(win).toHaveStyle({ left: `${1100 - width}px`, top: '28px' });

    const handle = win.querySelectorAll(':scope > div[aria-hidden]')[6]; // se
    fireEvent.pointerDown(handle, { button: 0, clientX: 600, clientY: 600 });
    act(() => {
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 9000, clientY: 9000 }));
      window.dispatchEvent(new MouseEvent('pointerup'));
    });
    // The dragged edges stop at the border of the desktop (dock reserves 64px).
    expect(win).toHaveStyle({ width: `${width}px`, height: `${900 - 28 - 64}px` });
  });

  it('follows the messages its windows send', async () => {
    await renderOs();
    await userEvent.click(within(dock()).getByRole('button', { name: 'Feed' }));

    postFrom('Inicio', { type: 'focus' });
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Inicio');

    postFrom('Inicio', { type: 'location', path: '/perfil/x', title: 'cat ~/perfil/x · pcn' });
    expect(window.location.pathname).toBe('/perfil/x');
    expect(document.title).toBe('cat ~/perfil/x · pcn-os');

    postFrom('Feed', { type: 'open', path: '/eventos/meetup' });
    expect(windows()).toHaveLength(3);
    expect(window.location.pathname).toBe('/eventos/meetup');
    // Opening a page that is already open focuses its window.
    postFrom('Feed', { type: 'open', path: '/perfil/x' });
    expect(windows()).toHaveLength(3);
    expect(window.location.pathname).toBe('/perfil/x');

    postFrom('Feed', { type: 'search', query: 'react' });
    expect(openGlobalSearch).toHaveBeenCalledWith('react');

    postFrom('Feed', { type: 'playMusic', id: radios[0].id });
    expect(await screen.findByTestId('music')).toHaveTextContent(radios[0].title);
    postFrom('Feed', { type: 'playMusic', id: 'no-existe' });
    expect(screen.getByTestId('music')).toHaveTextContent(radios[0].title);
  });

  it('relays a session change to the other windows and refreshes', async () => {
    await renderOs();
    await userEvent.click(within(dock()).getByRole('button', { name: 'Feed' }));
    const home = within(windowNamed('Inicio')).getByTitle('Inicio') as HTMLIFrameElement;
    const relay = jest.spyOn(home.contentWindow!, 'postMessage').mockImplementation(() => {});
    const feed = within(windowNamed('Feed')).getByTitle('Feed') as HTMLIFrameElement;
    const echo = jest.spyOn(feed.contentWindow!, 'postMessage').mockImplementation(() => {});

    postFrom('Feed', { type: 'session' });
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(relay).toHaveBeenCalledWith(
      { source: OS_MESSAGE_SOURCE, type: 'session' },
      window.location.origin,
    );
    expect(echo).not.toHaveBeenCalled();
  });

  it('ignores messages from other origins or from outside its windows', async () => {
    await renderOs();
    postFrom('Inicio', { type: 'open', path: '/feed' }, 'https://evil.example');
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { source: OS_MESSAGE_SOURCE, type: 'open', path: '/feed' },
          origin: window.location.origin,
          source: window,
        }),
      );
    });
    expect(windows()).toHaveLength(1);
  });

  it('opens pages asked for by the photos widget, the search and the user menu', async () => {
    await renderOs({ user: { id: 'u1', name: 'Ada', email: 'a@pcn.dev', image: null } });
    await userEvent.click(screen.getByRole('button', { name: 'foto' }));
    expect(window.location.pathname).toBe('/galeria/p1');

    act(() => mockSearchNavigate.current!('/feed'));
    expect(window.location.pathname).toBe('/feed');

    await userEvent.click(screen.getByRole('button', { name: /Ada/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ver mi perfil' }));
    expect(window.location.pathname).toBe('/perfil/u1');
    expect(windows()).toHaveLength(4);
  });

  it('reads the location of pages that load without the bridge', async () => {
    await renderOs();
    const iframe = within(windowNamed('Inicio')).getByTitle('Inicio') as HTMLIFrameElement;
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      value: { location: { pathname: '/autenticacion/iniciar-sesion', search: '?r=1' } },
    });
    Object.defineProperty(iframe, 'contentDocument', {
      configurable: true,
      value: { title: 'login · pcn' },
    });
    fireEvent.load(iframe);
    expect(window.location.pathname + window.location.search).toBe(
      '/autenticacion/iniciar-sesion?r=1',
    );

    // Another origin: the last known location stays.
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      get: () => {
        throw new Error('cross-origin');
      },
    });
    fireEvent.load(iframe);
    expect(window.location.pathname).toBe('/autenticacion/iniciar-sesion');
  });

  it('keeps windows in proportion when the screen is resized', async () => {
    await renderOs();
    const win = windowNamed('Inicio');
    const before = parseFloat(win.style.width);
    act(() => {
      setScreen(1650, 900);
      window.dispatchEvent(new Event('resize'));
    });
    expect(parseFloat(win.style.width)).toBeCloseTo(before * 1.5, -1);
  });

  it('saves the desktop and brings it back after a reload', async () => {
    window.history.replaceState(null, '', '/feed');
    const { unmount } = await renderOs();
    await userEvent.click(within(dock()).getByRole('button', { name: 'Inicio' }));
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY)!);
    expect(saved.windows.map((w: { path: string }) => w.path)).toEqual(['/feed', '/']);
    unmount();

    // The address bar shows the feed: its window comes back in front.
    window.history.replaceState(null, '', '/feed');
    await renderOs();
    expect(windows().map((w) => w.getAttribute('aria-label'))).toEqual(['Inicio', 'Feed']);
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Feed');
  });

  it('opens the address bar page on top of a restored session that lacks it', async () => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        viewport: { w: 1100, h: 900 },
        windows: [{ path: '/feed', x: 0, y: 28, w: 600, h: 500, minimized: true }],
      }),
    );
    window.history.replaceState(null, '', '/eventos');
    await renderOs();
    expect(windows().map((w) => w.getAttribute('aria-label'))).toEqual(['Feed', 'Eventos']);
    expect(focusedWindow()).toHaveAttribute('aria-label', 'Eventos');
  });

  it('puts windows to sleep in PCN OS liviano beyond the three most recent', async () => {
    root.setAttribute(MODE_ATTR, 'lite');
    await renderOs();
    const others = within(dock())
      .getAllByRole('button')
      .filter((b) => !['Inicio', 'Programas'].includes(b.getAttribute('aria-label')!))
      .slice(0, 3);
    for (const button of others) await userEvent.click(button);
    expect(windows()).toHaveLength(4);
    expect(within(windowNamed('Inicio')).getByText('[ en pausa ]')).toBeInTheDocument();
  });
});
