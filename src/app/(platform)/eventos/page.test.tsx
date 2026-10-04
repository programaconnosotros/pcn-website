import { render, screen } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { buildSession, renderInPlatform } from '@/test/platform';
import EventsPage, { metadata } from './page';
import Loading from './loading';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/components/events/events-list', () => ({
  EventsList: () => <div data-testid="events-list" />,
}));

const sessionAs = (user: { role?: 'USER' | 'ADMIN'; isAmbassador?: boolean }) => {
  const session = buildSession({ role: user.role });
  Object.assign(session.user, { isAmbassador: user.isAmbassador ?? false });
  jest.mocked(getCurrentSession).mockResolvedValue(session);
};

describe('EventsPage', () => {
  it('invites anonymous visitors to organize something instead of creating events', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(null);
    renderInPlatform(await EventsPage());

    expect(screen.getByRole('link', { name: /quiero organizar algo/ })).toHaveAttribute(
      'href',
      'https://wa.me/5493815777562',
    );
    expect(screen.queryByRole('link', { name: /crearEvento/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('events-list')).toBeInTheDocument();
  });

  it('shows the same invitation to members who cannot create events', async () => {
    sessionAs({ role: 'USER' });
    renderInPlatform(await EventsPage());

    expect(screen.getByText('quiero organizar algo')).toBeInTheDocument();
    expect(screen.queryByText('crearEvento();')).not.toBeInTheDocument();
  });

  it.each([
    ['admins', { role: 'ADMIN' as const }],
    ['ambassadors', { role: 'USER' as const, isAmbassador: true }],
  ])('lets %s create an event', async (_label, user) => {
    sessionAs(user);
    renderInPlatform(await EventsPage());

    expect(screen.getByRole('link', { name: /crearEvento/ })).toHaveAttribute(
      'href',
      '/eventos/nuevo',
    );
    expect(screen.queryByText('quiero organizar algo')).not.toBeInTheDocument();
  });

  it('describes the section for search engines and social cards', () => {
    expect(metadata.description).toMatch(/eventos de la comunidad/);
    expect(metadata.openGraph).toMatchObject({
      title: 'Eventos | programaConNosotros',
      url: expect.stringMatching(/\/eventos$/),
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });
});

describe('EventsPage loading', () => {
  it('renders only placeholders', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
  });
});
