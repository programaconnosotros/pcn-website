import { prismaMock } from '@/test/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { fetchFeed, type FeedItem } from '@/lib/feed';
import type { NotificationCenterData } from '@/lib/notification-center';
import { GET } from './route';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/feed', () => ({ fetchFeed: jest.fn() }));

const feed: FeedItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `evento-${i}`,
  kind: 'evento',
  day: '2026-10-01',
  sortKey: `2026-10-01T${String(i).padStart(2, '0')}:00:00.000Z`,
  title: `Evento ${i}`,
  description: 'no viaja',
  href: `/eventos/${i}`,
  thumbs: [{ id: 't', src: '/x.webp' }],
}));

const read = async () => {
  const response = await GET();
  return { response, body: (await response.json()) as NotificationCenterData };
};

beforeEach(() => {
  jest.mocked(fetchFeed).mockResolvedValue(feed);
});

describe('GET /api/notificaciones', () => {
  it('lists the latest feed news for anyone, without an inbox', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(null);
    const { response, body } = await read();

    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(body.inbox).toBeNull();
    expect(body.feed).toHaveLength(15);
    expect(body.feed[0]).toEqual({
      id: 'evento-0',
      kind: 'evento',
      title: 'Evento 0',
      href: '/eventos/0',
      sortKey: '2026-10-01T00:00:00.000Z',
    });
    expect(prismaMock.notification.findMany).not.toHaveBeenCalled();
  });

  it("adds the signed-in user's own inbox, with where each notification leads", async () => {
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: 'u1',
      user: { role: 'USER' },
    } as never);
    prismaMock.notification.count.mockResolvedValue(2);
    prismaMock.notification.findMany.mockResolvedValue([
      {
        id: 'n1',
        title: 'Nueva inscripción',
        message: 'Ana se anotó',
        read: false,
        createdAt: new Date('2026-10-06T10:00:00.000Z'),
        metadata: JSON.stringify({ href: '/consejos/c1' }),
      },
      {
        id: 'n2',
        title: 'Viejo',
        message: 'Sin link',
        read: true,
        createdAt: new Date('2026-10-05T10:00:00.000Z'),
        metadata: JSON.stringify({ href: 'https://evil.example' }),
      },
    ] as never);

    const { body } = await read();
    expect(prismaMock.notification.count).toHaveBeenCalledWith({
      where: { userId: 'u1', read: false },
    });
    expect(body.inbox).toEqual({
      unread: 2,
      items: [
        {
          id: 'n1',
          title: 'Nueva inscripción',
          message: 'Ana se anotó',
          read: false,
          createdAt: '2026-10-06T10:00:00.000Z',
          href: '/consejos/c1',
        },
        {
          id: 'n2',
          title: 'Viejo',
          message: 'Sin link',
          read: true,
          createdAt: '2026-10-05T10:00:00.000Z',
          href: null,
        },
      ],
    });
  });
});
