import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { signOut } from '@/actions/auth/sign-out';
import type { MusicPlayer } from '@/components/music/use-music-player';
import { externalPlaylists, radios } from '@/components/music/music-sets';
import { MODE_ATTR } from './os-display-mode-script';
import { OsMenuBar, type OsUser } from './os-menu-bar';
import { OsMusicControl } from './os-music-control';
import { OS_PROGRAMS, type OsProgram } from './programs';

// The bell polls its own endpoint; its behaviour is covered in notification-center.test.tsx.
jest.mock('@/components/notifications/notification-center', () => ({
  NotificationCenter: () => null,
}));
jest.mock('@/actions/auth/sign-out', () => ({ signOut: jest.fn(() => Promise.resolve()) }));
jest.mock('sonner', () => ({ toast: { promise: jest.fn() } }));

const user: OsUser = { id: 'u1', name: 'Ada Lovelace', email: 'ada@pcn.dev', image: null };
const program = (id: string) => OS_PROGRAMS.find((p) => p.id === id)!;

const fakePlayer = (overrides: Partial<MusicPlayer> = {}): MusicPlayer => ({
  current: null,
  playing: false,
  open: false,
  show: jest.fn(),
  hide: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  iframeRef: { current: null },
  onIframeLoad: jest.fn(),
  ...overrides,
});

const renderBar = (props: Partial<React.ComponentProps<typeof OsMenuBar>> = {}) => {
  const handlers = {
    onOpenProgram: jest.fn<void, [OsProgram]>(),
    onOpenPath: jest.fn<void, [string]>(),
    onOpenLauncher: jest.fn(),
  };
  render(
    <OsMenuBar
      user={null}
      focusedProgram={null}
      musicPlayer={fakePlayer()}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

const searchRequests = () => {
  const listener = jest.fn();
  window.addEventListener('pcn:open-search', listener);
  return listener;
};

afterEach(() => document.documentElement.removeAttribute(MODE_ATTR));

describe('OsMenuBar', () => {
  it('shows sign-in links for visitors, the clock and the focused program', () => {
    renderBar({ focusedProgram: program('feed') });
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion',
    );
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByText('~/feed')).toBeInTheDocument();
    expect(screen.getByTitle('Buscar en todo el sitio')).toHaveTextContent(/Ctrl K|⌘K/);
  });

  it('updates the clock', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2026-01-05T10:00:00'));
      renderBar();
      const clock = () => screen.getByText(/10:0\d/);
      expect(clock()).toHaveTextContent('10:00');
      act(() => {
        jest.setSystemTime(new Date('2026-01-05T10:01:00'));
        jest.advanceTimersByTime(15_000);
      });
      expect(clock()).toHaveTextContent('10:01');
    } finally {
      jest.useRealTimers();
    }
  });

  it('opens the global search from the bar', async () => {
    const listener = searchRequests();
    renderBar();
    await userEvent.click(screen.getByTitle('Buscar en todo el sitio'));
    expect(listener).toHaveBeenCalled();
  });

  it('runs the PCN_OS menu items', async () => {
    const listener = searchRequests();
    const { onOpenProgram, onOpenLauncher } = renderBar();

    await userEvent.click(screen.getByRole('button', { name: 'PCN_OS' }));
    expect(screen.getByRole('menu')).toHaveTextContent('online');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Acerca de programaConNosotros' }));
    expect(onOpenProgram).toHaveBeenCalledWith(program('historia'));

    await userEvent.click(screen.getByRole('button', { name: 'PCN_OS' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Todos los programas' }));
    expect(onOpenLauncher).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'PCN_OS' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Buscar…' }));
    expect(listener).toHaveBeenCalled();
  });

  it('switches the display mode from its submenu', async () => {
    renderBar();
    await userEvent.click(screen.getByRole('button', { name: 'PCN_OS' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Modo de PCN OS' }));
    const full = await screen.findByRole('menuitemradio', { name: /Completo/ });
    expect(full).toBeChecked();
    await userEvent.click(screen.getByRole('menuitemradio', { name: /Liviano/ }));
    expect(document.documentElement.getAttribute(MODE_ATTR)).toBe('lite');
  });

  it('lists the social networks', async () => {
    renderBar();
    await userEvent.click(screen.getByRole('button', { name: 'PCN_OS' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Redes' }));
    const links = await screen.findAllByRole('menuitem');
    expect(links.some((link) => link.getAttribute('target') === '_blank')).toBe(true);
  });

  it('gives signed-in users their menu', async () => {
    const { onOpenPath, onOpenProgram } = renderBar({ user });
    const trigger = screen.getByRole('button', { name: /Ada Lovelace/ });
    expect(trigger).toHaveTextContent('AL');

    await userEvent.click(trigger);
    expect(screen.getByRole('menu')).toHaveTextContent('ada@pcn.dev');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ver mi perfil' }));
    expect(onOpenPath).toHaveBeenCalledWith('/perfil/u1');

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Editar perfil' }));
    expect(onOpenProgram).toHaveBeenCalledWith(program('perfil'));

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));
    expect(signOut).toHaveBeenCalled();
    expect(toast.promise).toHaveBeenCalledWith(expect.any(Promise), {
      loading: 'Cerrando sesión...',
      success: 'Sesión cerrada correctamente',
      error: 'Error al cerrar sesión',
    });
  });
});

describe('OsMusicControl', () => {
  const renderControl = (player: MusicPlayer) =>
    render(<OsMusicControl player={player} menuTriggerClassName="" menuContentClassName="" />);

  it('starts the first radio when nothing is loaded', async () => {
    const player = fakePlayer();
    renderControl(player);
    expect(screen.getByTitle('Elegir música')).toHaveTextContent('música');
    await userEvent.click(screen.getByRole('button', { name: 'Reproducir música' }));
    expect(player.play).toHaveBeenCalledWith(radios[0]);
  });

  it('resumes the loaded set and pauses while playing', async () => {
    const paused = fakePlayer({ current: externalPlaylists[0] });
    const { unmount } = renderControl(paused);
    await userEvent.click(screen.getByRole('button', { name: 'Reproducir música' }));
    expect(paused.play).toHaveBeenCalledWith(externalPlaylists[0]);
    unmount();

    const playing = fakePlayer({ current: radios[1], playing: true });
    renderControl(playing);
    expect(screen.getByTitle(`Reproduciendo: ${radios[1].title}`)).toHaveTextContent(
      radios[1].title.toLowerCase(),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Pausar música' }));
    expect(playing.pause).toHaveBeenCalled();
  });

  it('picks a set, shows the player and stops it from the menu', async () => {
    const player = fakePlayer({ current: radios[0], playing: true });
    renderControl(player);
    const trigger = screen.getByTitle(`Reproduciendo: ${radios[0].title}`);

    await userEvent.click(trigger);
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: `> ${radios[0].title}` })).toBeVisible();
    await userEvent.click(within(menu).getByRole('menuitem', { name: radios[2].title }));
    expect(player.play).toHaveBeenCalledWith(radios[2]);

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Mostrar reproductor' }));
    expect(player.show).toHaveBeenCalled();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Detener' }));
    expect(player.stop).toHaveBeenCalled();
  });

  it('has no player actions when nothing is loaded', async () => {
    renderControl(fakePlayer());
    await userEvent.click(screen.getByTitle('Elegir música'));
    expect(screen.queryByRole('menuitem', { name: 'Detener' })).not.toBeInTheDocument();
  });
});
