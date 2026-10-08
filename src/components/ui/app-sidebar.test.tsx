import { render, screen } from '@testing-library/react';
import { consumeOpenSidebarRequest } from '@/components/os/os-display-mode';
import type { SessionUser } from '@/lib/session';
import { AppSidebar, secondaryItems, socialNetworks } from './app-sidebar';
import { SidebarProvider, useSidebar } from './sidebar';

let mockIsMobile = false;
jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mockIsMobile }));
jest.mock('@/components/os/os-display-mode', () => ({ consumeOpenSidebarRequest: jest.fn() }));
jest.mock('@/components/os/os-classic-return', () => ({ OsClassicReturn: () => null }));
jest.mock('@/components/search/search-trigger', () => ({
  SearchTrigger: () => <button type="button">buscar-stub</button>,
}));
jest.mock('@/components/ui/install-app-button', () => ({ InstallAppButton: () => null }));
jest.mock('@/components/ui/nav-user', () => ({
  NavUser: ({ user }: { user: { name: string } | null }) => (
    <span>{`nav-user:${user?.name ?? 'anon'}`}</span>
  ),
}));
jest.mock('@/components/ui/mobile-nav', () => ({
  MobileNav: ({ sections }: { sections: { label: string; items: { title: string }[] }[] }) => (
    <ul aria-label="mobile-nav">
      {sections.map((section) => (
        <li key={section.label}>{`${section.label}:${section.items.length}`}</li>
      ))}
    </ul>
  ),
}));

const admin = { id: 'u1', name: 'Ada', role: 'ADMIN' } as unknown as SessionUser;
const member = { id: 'u2', name: 'Bob', role: 'USER' } as unknown as SessionUser;

const State = () => <output aria-label="estado">{useSidebar().state}</output>;

const renderSidebar = (props: Partial<React.ComponentProps<typeof AppSidebar>> = {}) =>
  render(
    <SidebarProvider>
      <AppSidebar user={null} {...props} />
      <State />
    </SidebarProvider>,
  );

beforeEach(() => {
  mockIsMobile = false;
  jest.mocked(consumeOpenSidebarRequest).mockReturnValue(false);
});

describe('AppSidebar', () => {
  it('exports the social and secondary links', () => {
    expect(socialNetworks.map((network) => network.title)).toContain('Discord');
    expect(secondaryItems.map((item) => item.title)).toEqual(['Soporte', 'Feedback']);
  });

  it('renders the desktop sidebar for visitors without the admin section', () => {
    renderSidebar({
      upcomingEvents: [{ id: 'e1', name: 'Meetup', date: new Date('2025-06-26T22:00:00Z') }],
    });

    expect(screen.getByRole('link', { name: /programaConNosotros/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: 'buscar-stub' })).toBeInTheDocument();
    expect(screen.getByText('Actividades')).toBeInTheDocument();
    expect(screen.getByText('Recursos')).toBeInTheDocument();
    expect(screen.getByText('Comunidad')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Meetup/ })).toBeInTheDocument();
    expect(screen.queryByText('Administración')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Soporte' })).toBeInTheDocument();
    expect(screen.getByText('nav-user:anon')).toBeInTheDocument();
    expect(screen.getByLabelText('estado')).toHaveTextContent('collapsed');
  });

  it('adds the admin section with the unread notifications badge', () => {
    renderSidebar({ user: admin, unreadNotificationsCount: 7 });
    expect(screen.getByText('Administración')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Notificaciones/ })).toHaveTextContent('7');
  });

  it('opens itself when PCN OS just switched to the classic layout', () => {
    jest.mocked(consumeOpenSidebarRequest).mockReturnValue(true);
    renderSidebar();
    expect(screen.getByLabelText('estado')).toHaveTextContent('expanded');
  });

  it('renders the mobile navigation on phones, with admin only for admins', () => {
    mockIsMobile = true;
    const { unmount } = renderSidebar({ user: member });
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Actividades:8',
      'Recursos:7',
      'Comunidad:10',
    ]);
    expect(consumeOpenSidebarRequest).not.toHaveBeenCalled();
    unmount();

    renderSidebar({ user: admin });
    expect(screen.getByText('Administración:7')).toBeInTheDocument();
  });
});
