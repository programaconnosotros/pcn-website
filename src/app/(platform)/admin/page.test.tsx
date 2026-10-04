import { screen, within } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import prisma from '@/lib/prisma';
import { renderInPlatform } from '@/test/platform';
import AdminPanelPage, { metadata } from './page';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { count: jest.fn(), findMany: jest.fn() },
    pageVisit: { count: jest.fn(), groupBy: jest.fn() },
    errorLog: { count: jest.fn(), findMany: jest.fn() },
    talkProposal: { count: jest.fn() },
    notification: { count: jest.fn() },
    event: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));

const db = jest.mocked(prisma, { shallow: false }) as unknown as {
  user: { count: jest.Mock; findMany: jest.Mock };
  pageVisit: { count: jest.Mock; groupBy: jest.Mock };
  errorLog: { count: jest.Mock; findMany: jest.Mock };
  talkProposal: { count: jest.Mock };
  notification: { count: jest.Mock };
  event: { findMany: jest.Mock };
  $queryRaw: jest.Mock;
};

const NOW = Date.now();
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires',
}).format(new Date(NOW));

const asAdmin = () =>
  jest.mocked(getCurrentSession).mockResolvedValue({
    user: { id: 'admin', role: 'ADMIN' },
  } as never);

const seed = ({ empty = false } = {}) => {
  db.user.count.mockResolvedValueOnce(120).mockResolvedValueOnce(7);
  db.pageVisit.count.mockResolvedValueOnce(42).mockResolvedValueOnce(300);
  db.errorLog.count.mockResolvedValueOnce(empty ? 0 : 3).mockResolvedValueOnce(1);
  db.talkProposal.count.mockResolvedValue(4);
  db.notification.count.mockResolvedValue(9);
  db.event.findMany.mockResolvedValue(
    empty
      ? []
      : [
          {
            id: 'e1',
            name: 'Meetup lleno',
            date: new Date(NOW + 86_400_000),
            capacity: 10,
            _count: { registrations: 12 },
          },
          {
            id: 'e2',
            name: 'Meetup libre',
            date: new Date(NOW + 2 * 86_400_000),
            capacity: null,
            _count: { registrations: 5 },
          },
        ],
  );
  db.errorLog.findMany.mockResolvedValue(
    empty
      ? []
      : [
          { id: 'x1', message: 'Boom', path: '/eventos', createdAt: new Date(NOW - 5 * 60_000) },
          { id: 'x2', message: 'Sin ruta', path: null, createdAt: new Date(NOW - 5 * 3_600_000) },
          { id: 'x3', message: 'Viejo', path: null, createdAt: new Date(NOW - 5 * 86_400_000) },
        ],
  );
  db.user.findMany.mockResolvedValue([
    { id: 'u1', name: 'Ada', email: 'ada@test.dev', createdAt: new Date(NOW), emailVerified: true },
    {
      id: 'u2',
      name: 'Bob',
      email: 'bob@test.dev',
      createdAt: new Date(NOW),
      emailVerified: false,
    },
  ]);
  db.pageVisit.groupBy.mockResolvedValue([
    { path: '/eventos', _count: { path: 30 } },
    { path: '/feed', _count: { path: 15 } },
  ]);
  db.$queryRaw
    .mockResolvedValueOnce([{ day: today, count: 11 }])
    .mockResolvedValueOnce([{ day: today, count: 2 }]);
};

const renderPage = async () => renderInPlatform(await AdminPanelPage());

describe('AdminPanelPage', () => {
  it('is an admin-only page kept out of search engines', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toBe('sudo ls ~/admin');
  });

  it('sends non-admins to the home page without querying the database', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue({ user: { role: 'USER' } } as never);
    await expect(AdminPanelPage()).rejects.toThrow('NEXT_REDIRECT:/');
    expect(redirect).toHaveBeenCalledWith('/');
    expect(db.user.count).not.toHaveBeenCalled();
  });

  it('shows the KPIs, flagging unresolved errors', async () => {
    asAdmin();
    seed();
    await renderPage();

    const users = screen.getByRole('link', { name: /usuarios 120/ });
    expect(users).toHaveAttribute('href', '/usuarios');
    expect(users).toHaveTextContent('+7 esta semana');
    expect(screen.getByRole('link', { name: /visitas 24h 42/ })).toHaveTextContent('300 en 7 días');
    const errors = screen.getByRole('link', { name: /Requiere atención errores 3/ });
    expect(errors).toHaveAttribute('href', '/monitoreo');
    expect(errors).toHaveTextContent('1 nuevos en 24h');
    expect(screen.getByRole('link', { name: /propuestas 4/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /notificaciones 9/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^eventos 2/ })).toBeInTheDocument();
  });

  it('charts the last 30 days of visits and signups, filling missing days with 0', async () => {
    asAdmin();
    seed();
    await renderPage();
    expect(
      screen.getByRole('img', {
        name: 'Visitas por día: 11 visitas en 30 días, máximo 11 en un día',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Usuarios nuevos por día: 2 altas en 30 días, máximo 2 en un día',
      }),
    ).toBeInTheDocument();
  });

  it('lists recent errors, upcoming events, top pages, signups and admin tools', async () => {
    asAdmin();
    seed();
    await renderPage();

    expect(screen.getByTitle('Boom')).toBeInTheDocument();
    expect(screen.getByTitle('Sin ruta')).toBeInTheDocument();
    expect(screen.getByText('Viejo')).toBeInTheDocument();

    const full = screen.getByRole('link', { name: 'Meetup lleno' });
    expect(full).toHaveAttribute('href', '/eventos/e1/inscripciones');
    expect(full.closest('tr')).toHaveTextContent('12/10');
    expect(screen.getByRole('link', { name: 'Meetup libre' }).closest('tr')).toHaveTextContent(
      /5$/,
    );

    expect(screen.getByTitle('/feed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ada' })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.getByTitle('Email verificado')).toBeInTheDocument();
    expect(screen.getByTitle('Email sin verificar')).toBeInTheDocument();

    const tools = screen.getByRole('heading', { name: 'herramientas' }).closest('section')!;
    const hrefs = within(tools)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/usuarios');
    expect(hrefs).not.toContain('/admin');
  });

  it('shows the empty states when there are no errors or upcoming events', async () => {
    asAdmin();
    seed({ empty: true });
    await renderPage();
    expect(screen.getByText('✓ sin errores pendientes')).toBeInTheDocument();
    expect(screen.getByText('no hay eventos próximos')).toBeInTheDocument();
    expect(screen.queryByLabelText('Requiere atención')).not.toBeInTheDocument();
  });
});
