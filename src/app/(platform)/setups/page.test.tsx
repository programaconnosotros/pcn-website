import { screen, within } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { SetupTile } from '@/components/setups/setup-tile';
import { fetchSetups, type SetupWithAuthor } from '@/lib/setups';
import { expectOnlyPlaceholders, renderPage, sessionRow } from '@/test/pages-m-z';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import SetupsPage, { metadata } from './page';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/setups', () => ({
  ...jest.requireActual('@/lib/setups'),
  fetchSetups: jest.fn(),
}));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {} }));
jest.mock('@/lib/cache', () => ({
  cached: (_name: string, fn: (..._args: unknown[]) => unknown) => fn,
}));
jest.mock('@/components/setups/setup-tile', () => ({
  SetupTile: jest.fn(({ setup }: { setup: { title: string } }) => <p>{setup.title}</p>),
}));
jest.mock('@/components/setups/setup-form-dialog', () => ({
  SetupFormDialog: () => <button type="button">nuevo setup</button>,
}));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

const setup = (id: string) => ({ id, title: `Setup ${id}` }) as SetupWithAuthor;
const page = (searchParams: Record<string, string> = {}) =>
  SetupsPage({ searchParams: Promise.resolve(searchParams) });

describe('/setups', () => {
  it('has its title and share cards', () => {
    expect(metadata.title).toBe('ls ~/setups');
    expect(metadata.openGraph).toMatchObject({
      title: 'Setups de la comunidad | programaConNosotros',
    });
  });

  it('invites the first setup and sends anonymous visitors to log in to share one', async () => {
    jest.mocked(fetchSetups).mockResolvedValue([]);
    jest.mocked(getCurrentSession).mockResolvedValue(null);

    await renderPage(page());

    expect(fetchSetups).toHaveBeenCalledWith('recientes');
    expect(screen.getByText('0 setups de la comunidad')).toBeInTheDocument();
    expect(screen.getByText(/Todavía nadie compartió su setup/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /compartirSetup/ })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion?redirect=/setups',
    );
    expect(screen.queryByRole('navigation', { name: 'Orden' })).not.toBeInTheDocument();
  });

  it('shows a single setup without sort tabs, and the share dialog to members', async () => {
    jest.mocked(fetchSetups).mockResolvedValue([setup('a')]);
    jest.mocked(getCurrentSession).mockResolvedValue(sessionRow({ id: 'viewer' }));

    await renderPage(page());

    expect(screen.getByText('1 setup de la comunidad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'nuevo setup' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Orden' })).not.toBeInTheDocument();
    expect(jest.mocked(SetupTile).mock.calls[0][0]).toEqual({
      setup: setup('a'),
      viewerId: 'viewer',
    });
  });

  it('sorts by popularity when asked and marks the active tab', async () => {
    jest.mocked(fetchSetups).mockResolvedValue([setup('a'), setup('b')]);
    jest.mocked(getCurrentSession).mockResolvedValue(null);

    await renderPage(page({ orden: 'populares' }));

    expect(fetchSetups).toHaveBeenCalledWith('populares');
    const tabs = within(screen.getByRole('navigation', { name: 'Orden' }));
    expect(tabs.getByRole('link', { name: /recientes/ })).toHaveAttribute('href', '/setups');
    expect(tabs.getByRole('link', { name: /recientes/ })).not.toHaveAttribute('aria-current');
    expect(tabs.getByRole('link', { name: /populares/ })).toHaveAttribute(
      'href',
      '/setups?orden=populares',
    );
    expect(tabs.getByRole('link', { name: /populares/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Setup b')).toBeInTheDocument();
    expect(jest.mocked(SetupTile).mock.calls[0][0].viewerId).toBeNull();
  });

  it('falls back to the newest first for an unknown order', async () => {
    jest.mocked(fetchSetups).mockResolvedValue([]);
    jest.mocked(getCurrentSession).mockResolvedValue(null);

    await renderPage(page({ orden: 'raro' }));

    expect(fetchSetups).toHaveBeenCalledWith('recientes');
  });

  it('uses the setups section card for link previews', async () => {
    expect(alt).toBe('setups · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'setups' });
  });

  it('shows eight placeholder tiles while loading', () => {
    const container = expectOnlyPlaceholders(<Loading />);
    expect(container.querySelectorAll('.aspect-3\\/4')).toHaveLength(8);
  });
});
