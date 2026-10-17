import { prismaMock } from '@/test/prisma';
import { hashSessionToken } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import { countNotifications, fetchNotifications } from './fetch-notifications';

const adminUser = {
  id: 'user-admin',
  name: 'Admin',
  email: 'admin@pcn.com',
  password: 'hash',
  emailVerified: true,
  role: 'ADMIN' as const,
  phoneNumber: null,
  image: null,
  countryOfOrigin: null,
  province: null,
  xAccountUrl: null,
  linkedinUrl: null,
  gitHubUrl: null,
  slogan: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const adminSession = {
  id: 'session-admin',
  userId: 'user-admin',
  expires: new Date('2027-01-01'),
  user: adminUser,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const stubNotifications = [
  {
    id: 'notif-1',
    type: 'NEW_EVENT',
    title: 'New event',
    message: 'An event was created',
    userId: 'user-admin',
    read: false,
    metadata: null,
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01'),
  },
  {
    id: 'notif-2',
    type: 'NEW_EVENT',
    title: 'Another event',
    message: 'Another event was created',
    userId: 'user-admin',
    read: true,
    metadata: null,
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-01'),
  },
];

describe('fetchNotifications', () => {
  it('returns an empty array when there is no sessionId cookie', async () => {
    mockCookies();

    const result = await fetchNotifications();

    expect(result).toEqual([]);
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('returns an empty array when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    const result = await fetchNotifications();

    expect(result).toEqual([]);
    expect(prismaMock.notification.findMany).not.toHaveBeenCalled();
  });

  it('returns notifications for the current user ordered by createdAt desc', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.findMany.mockResolvedValue(stubNotifications as any);

    const result = await fetchNotifications();

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: {
        id: hashSessionToken('session-admin'),
        expires: { gt: expect.any(Date) },
        user: { suspendedAt: null, deactivatedAt: null },
      },
      include: { user: true },
    });
    expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-admin' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    expect(result).toEqual(stubNotifications);
  });

  it('returns an empty array when the user has no notifications', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.findMany.mockResolvedValue([]);

    const result = await fetchNotifications();

    expect(result).toEqual([]);
  });
});

describe('countNotifications', () => {
  it('counts all and unread notifications of the session user, and nothing without one', async () => {
    mockCookies();
    await expect(countNotifications()).resolves.toEqual({ total: 0, unread: 0 });
    expect(prismaMock.notification.count).not.toHaveBeenCalled();

    mockCookies({ sessionId: 's1' });
    prismaMock.session.findUnique.mockResolvedValue({ userId: 'u1', user: { id: 'u1' } } as never);
    prismaMock.notification.count.mockResolvedValueOnce(340).mockResolvedValueOnce(2);
    await expect(countNotifications()).resolves.toEqual({ total: 340, unread: 2 });
    expect(prismaMock.notification.count).toHaveBeenCalledWith({
      where: { userId: 'u1', read: false },
    });
  });
});
