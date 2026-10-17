import { render, screen } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import prisma from '@/lib/prisma';
import { renderInPlatform } from '@/test/platform';
import Loading from './loading';
import AnaliticasPage, { metadata } from './page';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/prisma', () => {
  const model = () => ({
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    groupBy: jest.fn(),
  });
  return {
    __esModule: true,
    default: {
      user: model(),
      advice: model(),
      event: model(),
      like: model(),
      comment: model(),
      project: model(),
      talk: model(),
      eventRegistration: model(),
      userLanguage: model(),
    },
  };
});

type Model = Record<'count' | 'findMany' | 'findFirst' | 'groupBy', jest.Mock>;
const db = prisma as unknown as Record<string, Model>;

type CountArgs = { where?: Record<string, unknown> } | undefined;
const counts = (total: number, filtered: number) => (args: CountArgs) =>
  Promise.resolve(args?.where ? filtered : total);

const seed = ({ empty = false } = {}) => {
  db.user.count.mockImplementation((args: CountArgs) =>
    Promise.resolve(!args?.where ? 100 : 'sessions' in args.where ? 20 : 5),
  );
  db.advice.count.mockImplementation(counts(empty ? 0 : 10, 2));
  db.like.count.mockImplementation(counts(25, 3));
  db.comment.count.mockImplementation(counts(8, 1));
  db.event.count.mockImplementation((args: { where: { date: { lt?: Date } } }) =>
    Promise.resolve(args.where.date.lt ? 6 : 2),
  );
  db.project.count.mockResolvedValue(12);
  db.talk.count.mockResolvedValue(30);
  db.eventRegistration.count.mockResolvedValue(44);
  db.event.findFirst.mockResolvedValue(
    empty ? null : { name: 'Meetup de otoño', city: 'Online', date: new Date('2026-11-01T22:00Z') },
  );
  db.userLanguage.groupBy.mockResolvedValue(
    empty
      ? []
      : [
          { language: 'TypeScript', _count: { language: 9 } },
          { language: 'Go', _count: { language: 4 } },
        ],
  );
  db.advice.findMany.mockResolvedValue(
    empty
      ? []
      : [
          { content: 'Poco querido', likes: [{}] },
          { content: 'Escribí tests', likes: [{}, {}, {}] },
        ],
  );
  db.user.findMany.mockResolvedValue([
    {
      id: 'u1',
      name: 'Ada',
      email: 'ada@test.dev',
      createdAt: new Date('2026-01-02T12:00Z'),
      jobTitle: 'Dev',
      enterprise: 'ACME',
      countryOfOrigin: 'Uruguay',
    },
    {
      id: 'u2',
      name: null,
      email: 'anon@test.dev',
      createdAt: new Date('2026-01-03T12:00Z'),
      jobTitle: null,
      enterprise: 'Solo empresa',
      countryOfOrigin: null,
    },
    {
      id: 'u3',
      name: 'Sin datos',
      email: 'nada@test.dev',
      createdAt: new Date('2026-01-04T12:00Z'),
      jobTitle: null,
      enterprise: null,
      countryOfOrigin: null,
    },
  ]);
};

const statValue = (title: string) => screen.getByText(title).parentElement!.nextElementSibling;

describe('AnaliticasPage', () => {
  it('is admin-only and not indexed', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('redirects non-admins home', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(null);
    await expect(AnaliticasPage()).rejects.toThrow('NEXT_REDIRECT:/');
  });

  describe('as an admin', () => {
    beforeEach(() => {
      jest.mocked(getCurrentSession).mockResolvedValue({ user: { role: 'ADMIN' } } as never);
    });

    it('shows totals, last-month numbers and engagement averages', async () => {
      seed();
      renderInPlatform(await AnaliticasPage());

      expect(
        screen.getByText('100 usuarios · 10 consejos · 2 eventos próximos'),
      ).toBeInTheDocument();
      expect(statValue('Total de Usuarios')).toHaveTextContent('100');
      expect(statValue('Usuarios Activos')).toHaveTextContent('20');
      expect(statValue('Usuarios Nuevos')).toHaveTextContent('5');
      expect(statValue('Consejos Nuevos')).toHaveTextContent('2');
      expect(statValue('Promedio Likes/Consejo')).toHaveTextContent('2.5');
      expect(statValue('Promedio Comentarios/Consejo')).toHaveTextContent('0.8');
      expect(statValue('Eventos Pasados')).toHaveTextContent('6');
      expect(statValue('Inscripciones')).toHaveTextContent('44');
    });

    it('highlights the most liked advice, the next event and the top languages', async () => {
      seed();
      renderInPlatform(await AnaliticasPage());

      expect(screen.getByText('Escribí tests')).toBeInTheDocument();
      expect(screen.queryByText('Poco querido')).not.toBeInTheDocument();
      expect(screen.getByText('3 likes')).toBeInTheDocument();
      expect(screen.getByText('Meetup de otoño')).toBeInTheDocument();
      expect(screen.getByText('TypeScript').nextSibling).toHaveTextContent('9');
    });

    it('lists the latest users with fallbacks for missing data', async () => {
      seed();
      renderInPlatform(await AnaliticasPage());

      expect(screen.getByText('usuarios · últimos 3')).toBeInTheDocument();
      const ada = screen.getByText('Ada').closest('tr')!;
      expect(ada).toHaveTextContent('Dev en ACME');
      expect(ada).toHaveTextContent('Uruguay');
      const anon = screen.getByText('anon@test.dev').closest('tr')!;
      expect(anon.firstChild).toHaveTextContent('-');
      expect(anon).toHaveTextContent('Solo empresa');
      const empty = screen.getByText('Sin datos').closest('tr')!;
      expect(empty.children[2]).toHaveTextContent('-');
    });

    it('hides highlights and averages 0 without advice, events or languages', async () => {
      seed({ empty: true });
      renderInPlatform(await AnaliticasPage());

      expect(screen.queryByText('destacados')).not.toBeInTheDocument();
      expect(statValue('Promedio Likes/Consejo')).toHaveTextContent('0');
      expect(statValue('Promedio Comentarios/Consejo')).toHaveTextContent('0');
    });
  });
});

describe('Loading', () => {
  it('renders a skeleton of the stats grid', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).not.toBeEmptyDOMElement();
  });
});
