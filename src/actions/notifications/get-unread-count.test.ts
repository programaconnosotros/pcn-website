import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { getUnreadNotificationsCount } from './get-unread-count';

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

const regularUser = { ...adminUser, id: 'user-regular', role: 'REGULAR' as const };
const regularSession = {
  ...adminSession,
  id: 'session-regular',
  userId: 'user-regular',
  user: regularUser,
};

describe('getUnreadNotificationsCount', () => {
  it('returns 0 when there is no sessionId cookie', async () => {
    mockCookies();

    const result = await getUnreadNotificationsCount();

    expect(result).toBe(0);
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('returns 0 when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    const result = await getUnreadNotificationsCount();

    expect(result).toBe(0);
    expect(prismaMock.notification.count).not.toHaveBeenCalled();
  });

  it('returns 0 when the session user is not an ADMIN', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    const result = await getUnreadNotificationsCount();

    expect(result).toBe(0);
    expect(prismaMock.notification.count).not.toHaveBeenCalled();
  });

  it('returns the unread notification count for an ADMIN user', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.count.mockResolvedValue(5);

    const result = await getUnreadNotificationsCount();

    expect(prismaMock.notification.count).toHaveBeenCalledWith({
      where: { userId: 'user-admin', read: false },
    });
    expect(result).toBe(5);
  });

  it('returns 0 when the ADMIN has no unread notifications', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.count.mockResolvedValue(0);

    const result = await getUnreadNotificationsCount();

    expect(result).toBe(0);
  });
});
