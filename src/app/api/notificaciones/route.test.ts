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
  it('lists the latest feed news for anyone, without admin data', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(null);
    const { response, body } = await read();

    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(body.admin).toBeNull();
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

  it("adds an admin's own inbox", async () => {
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: 'admin-1',
      user: { role: 'ADMIN' },
    } as never);
    prismaMock.notification.count.mockResolvedValue(2);
    prismaMock.notification.findMany.mockResolvedValue([
      {
        id: 'n1',
        title: 'Nueva inscripción',
        message: 'Ana se anotó',
        read: false,
        createdAt: new Date('2026-10-06T10:00:00.000Z'),
      },
    ] as never);

    const { body } = await read();
    expect(prismaMock.notification.count).toHaveBeenCalledWith({
      where: { userId: 'admin-1', read: false },
    });
    expect(body.admin).toEqual({
      unread: 2,
      items: [
        {
          id: 'n1',
          title: 'Nueva inscripción',
          message: 'Ana se anotó',
          read: false,
          createdAt: '2026-10-06T10:00:00.000Z',
        },
      ],
    });
  });

  it('keeps admin data from members', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: 'u1',
      user: { role: 'USER' },
    } as never);
    expect((await read()).body.admin).toBeNull();
  });
});
