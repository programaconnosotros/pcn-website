import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bell, CalendarDays, Home, LifeBuoy, Share2 } from 'lucide-react';
import { openGlobalSearch } from '@/components/search/global-search';
import type { SessionUser } from '@/lib/session';
import { mockRouter, setLocation } from '@/test/dom';
import { MobileNav, type NavSection } from './mobile-nav';
import { SidebarProvider } from './sidebar';

jest.mock('@/components/search/global-search', () => ({ openGlobalSearch: jest.fn() }));
jest.mock('@/components/ui/install-app-button', () => ({
  InstallAppButton: () => <span>instalar-stub</span>,
}));
jest.mock('@/components/ui/nav-user', () => ({
  NavUser: ({ user }: { user: { name: string } | null }) => (
    <span>{`nav-user:${user?.name ?? 'anon'}`}</span>
  ),
}));

const sections: NavSection[] = [
  {
    label: 'Actividades',
    items: [
      { title: 'Eventos', url: '/eventos', icon: CalendarDays },
      { title: 'Notificaciones', url: '/notificaciones', icon: Bell, badge: 120 },
      { title: 'Pocas', url: '/pocas', icon: Bell, badge: 3 },
    ],
  },
  {
    items: [
      { title: 'Inicio', url: '/', icon: Home },
      {
        title: 'Redes',
        icon: Share2,
        items: [{ title: 'Discord', url: 'https://www.discord.gg/x' }],
      },
      { title: 'Solo grupo', icon: Share2 },
    ],
  },
];
const footerItems = [{ title: 'Soporte', url: 'https://wa.me/1', icon: LifeBuoy }];

const user = { id: 'u1', name: 'Ádám Lovelace', email: 'a@b.c' } as unknown as SessionUser;

const originalMatchMedia = window.matchMedia;
const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

const renderNav = (value: SessionUser | null = null) =>
  render(
    <SidebarProvider>
      <MobileNav sections={sections} footerItems={footerItems} user={value} />
    </SidebarProvider>,
  );

const openMenu = () => userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
// While the menu is open Radix hides the rest of the page from assistive tech.
const tabBar = () => screen.getByRole('navigation', { name: 'Navegación principal', hidden: true });

// jsdom can't follow links; the router is mocked, so stop the default navigation once the
// component's own click handlers have run.
const stopNavigation = (event: Event) => event.preventDefault();

beforeEach(() => {
  window.addEventListener('click', stopNavigation);
  // Radix nags about the sheet having no Description; the menu has none by design.
  const warn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    if (!String(args[0]).includes('Missing `Description`')) warn(...args);
  });
  setReducedMotion(true);
  setLocation('/eventos');
});

afterEach(() => {
  window.removeEventListener('click', stopNavigation);
  jest.mocked(console.warn).mockRestore();
  window.matchMedia = originalMatchMedia;
  jest.useRealTimers();
  setLocation('/');
});

describe('MobileNav', () => {
  it('renders the tab bar with the current tab active', () => {
    renderNav();
    const tabs = within(tabBar());
    expect(tabs.getByRole('link', { name: 'Eventos' })).toHaveAttribute('aria-current', 'page');
    expect(tabs.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the terminal menu with every destination, numbered', async () => {
    renderNav(user);
    await openMenu();

    const dialog = screen.getByRole('dialog');
    expect(screen.getByRole('button', { name: 'Cerrar menú', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    // No tab is highlighted while the menu is open.
    expect(
      within(tabBar()).getByRole('link', { name: 'Eventos', hidden: true }),
    ).not.toHaveAttribute('aria-current');
    expect(within(dialog).getByText('adam@pcn')).toBeInTheDocument();
    expect(within(dialog).getByText('06/06')).toBeInTheDocument();
    expect(within(dialog).getByText('Actividades')).toBeInTheDocument();
    expect(within(dialog).getByText('Sección 2')).toBeInTheDocument();
    expect(within(dialog).getByText('Ayuda')).toBeInTheDocument();

    const eventos = within(dialog).getByRole('link', { name: /Eventos/ });
    expect(eventos).toHaveAttribute('aria-current', 'page');
    expect(eventos).toHaveTextContent('▸');
    expect(within(dialog).getByRole('link', { name: /Notificaciones/ })).toHaveTextContent('99+');
    expect(within(dialog).getByRole('link', { name: /Pocas/ })).toHaveTextContent('3');
    expect(within(dialog).getByRole('link', { name: /Inicio/ })).toHaveTextContent('04');
    expect(within(dialog).getByRole('link', { name: /Inicio/ })).toHaveTextContent('~/');
    const discord = within(dialog).getByRole('link', { name: /Discord/ });
    expect(discord).toHaveAttribute('target', '_blank');
    expect(discord).toHaveTextContent('discord.gg');
    expect(within(dialog).getByText('nav-user:Ádám Lovelace')).toBeInTheDocument();
    expect(within(dialog).getByText('instalar-stub')).toBeInTheDocument();
    expect(
      within(dialog).getByText('~/eventos', { selector: '.text-pcnGreen-700' }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('6 rutas')).toBeInTheDocument();
    expect(within(dialog).getByText(/^\d\d:\d\d$/)).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: /exit/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls a visitor guest', async () => {
    renderNav();
    await openMenu();
    expect(screen.getByText('guest@pcn')).toBeInTheDocument();
    expect(screen.getByText('nav-user:anon')).toBeInTheDocument();
  });

  it('filters destinations ignoring accents and slashes, then opens the first with Enter', async () => {
    renderNav();
    await openMenu();
    const search = screen.getByRole('searchbox', { name: 'Buscar sección' });

    await userEvent.type(search, '/NOTIFICACIONES/');
    expect(screen.getByText('01/06')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).queryByRole('link', { name: /Eventos/ })).toBeNull();
    expect(screen.queryByText('instalar-stub')).not.toBeInTheDocument();

    await userEvent.type(search, '{Enter}');
    expect(mockRouter.push).toHaveBeenCalledWith('/notificaciones');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens an external first match in a new tab', async () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderNav();
    await openMenu();
    await userEvent.type(screen.getByRole('searchbox'), 'discord{Enter}');
    expect(open).toHaveBeenCalledWith('https://www.discord.gg/x', '_blank', 'noopener,noreferrer');
    open.mockRestore();
  });

  it('does nothing on Enter without a query', async () => {
    renderNav();
    await openMenu();
    await userEvent.type(screen.getByRole('searchbox'), '   {Enter}');
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('reports no match and clears the query', async () => {
    renderNav();
    await openMenu();
    const search = screen.getByRole('searchbox');
    await userEvent.type(search, 'zzz');
    expect(
      screen.getByText('bash: cd: zzz: No existe el archivo o el directorio'),
    ).toBeInTheDocument();

    await userEvent.type(search, '{Enter}');
    expect(mockRouter.push).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: '$ clear' }));
    expect(search).toHaveValue('');
    expect(screen.getByText('06/06')).toBeInTheDocument();
  });

  it('hands the query to the site-wide search', async () => {
    renderNav();
    await openMenu();
    await userEvent.click(screen.getByRole('button', { name: /buscar en todo el sitio/ }));
    expect(openGlobalSearch).toHaveBeenCalledWith('');

    await openMenu();
    await userEvent.type(screen.getByRole('searchbox'), ' react ');
    const find = screen.getByRole('button', { name: /find ~ -iname "react"/ });
    await userEvent.click(find);
    expect(openGlobalSearch).toHaveBeenLastCalledWith('react');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('scrolls to the top when tapping the current tab', async () => {
    renderNav();
    await userEvent.click(within(tabBar()).getByRole('link', { name: 'Eventos' }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('closes the menu from the current tab without scrolling', async () => {
    renderNav();
    await openMenu();
    jest.mocked(window.scrollTo).mockClear();
    // The modal sets pointer-events: none on the body; the tab bar opts back in with CSS.
    fireEvent.click(within(tabBar()).getByRole('link', { name: 'Eventos', hidden: true }));
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves modified clicks to the browser', async () => {
    renderNav();
    const user = userEvent.setup();
    await user.keyboard('{Control>}');
    await user.click(within(tabBar()).getByRole('link', { name: 'Eventos' }));
    await user.keyboard('{/Control}');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('restores the scroll position of a tab when coming back to it', async () => {
    const { rerender } = renderNav();
    Object.defineProperty(window, 'scrollY', { value: 340, configurable: true });

    await userEvent.click(within(tabBar()).getByRole('link', { name: 'Inicio' }));
    setLocation('/');
    rerender(
      <SidebarProvider>
        <MobileNav sections={sections} footerItems={footerItems} user={null} />
      </SidebarProvider>,
    );
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    await userEvent.click(within(tabBar()).getByRole('link', { name: 'Eventos' }));
    setLocation('/eventos');
    rerender(
      <SidebarProvider>
        <MobileNav sections={sections} footerItems={footerItems} user={null} />
      </SidebarProvider>,
    );
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 340);
  });

  it('scrambles the labels into place when motion is allowed', async () => {
    setReducedMotion(false);
    jest.useFakeTimers();
    renderNav();
    act(() => {
      screen.getByRole('button', { name: 'Abrir menú' }).click();
    });
    const dialog = screen.getByRole('dialog');
    const visible = () =>
      within(dialog)
        .getByRole('link', { name: /Eventos/ })
        .querySelector('span[aria-hidden="true"]:not(.sr-only)');

    act(() => {
      jest.advanceTimersByTime(22 + 30 * 3);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(visible()).toHaveTextContent('Eventos');
    act(() => {
      jest.advanceTimersByTime(15_000);
    });
  });
});
