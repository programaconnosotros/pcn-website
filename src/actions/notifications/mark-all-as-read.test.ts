import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { markAllNotificationsAsRead } from './mark-all-as-read';

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

describe('markAllNotificationsAsRead', () => {
  it('throws "No autorizado" when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(markAllNotificationsAsRead()).rejects.toThrow('No autorizado');
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws "No autorizado" when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(markAllNotificationsAsRead()).rejects.toThrow('No autorizado');
    expect(prismaMock.notification.updateMany).not.toHaveBeenCalled();
  });

  it('marks all unread notifications as read and revalidates the path on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.updateMany.mockResolvedValue({ count: 3 });

    await markAllNotificationsAsRead();

    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-admin', read: false },
      data: { read: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/notificaciones');
  });

  it('still revalidates the path when there are no unread notifications', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.updateMany.mockResolvedValue({ count: 0 });

    await markAllNotificationsAsRead();

    expect(prismaMock.notification.updateMany).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/notificaciones');
  });
});
