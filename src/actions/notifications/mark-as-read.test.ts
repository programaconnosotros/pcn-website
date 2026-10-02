import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { markNotificationAsRead } from './mark-as-read';

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

const stubNotification = {
  id: 'notif-1',
  type: 'NEW_EVENT',
  title: 'New event',
  message: 'An event was created',
  userId: 'user-admin',
  read: false,
  metadata: null,
  createdAt: new Date('2025-06-01'),
  updatedAt: new Date('2025-06-01'),
};

describe('markNotificationAsRead', () => {
  it('throws "No autorizado" when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(markNotificationAsRead('notif-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws "No autorizado" when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(markNotificationAsRead('notif-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.notification.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the notification does not exist', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.findUnique.mockResolvedValue(null);

    await expect(markNotificationAsRead('notif-1')).rejects.toThrow(
      'No tienes permisos para marcar esta notificación como leída',
    );
    expect(prismaMock.notification.update).not.toHaveBeenCalled();
  });

  it('throws when the notification belongs to a different user', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.findUnique.mockResolvedValue({
      ...stubNotification,
      userId: 'user-other',
    } as any);

    await expect(markNotificationAsRead('notif-1')).rejects.toThrow(
      'No tienes permisos para marcar esta notificación como leída',
    );
    expect(prismaMock.notification.update).not.toHaveBeenCalled();
  });

  it('marks the notification as read and revalidates the path on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.notification.findUnique.mockResolvedValue(stubNotification as any);
    prismaMock.notification.update.mockResolvedValue({ ...stubNotification, read: true } as any);

    await markNotificationAsRead('notif-1');

    expect(prismaMock.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-1' },
      data: { read: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/notificaciones');
  });
});
