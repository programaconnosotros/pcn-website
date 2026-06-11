import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { cancelRegistration } from './cancel-registration';

jest.mock('@/actions/notifications/notify-admins', () => ({
  notifyAdmins: jest.fn().mockResolvedValue(undefined),
}));

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

const mockEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  deletedAt: null,
};

const mockRegistration = {
  id: 'reg-1',
  eventId: 'event-1',
  userId: 'user-admin',
  cancelledAt: null,
  createdAt: new Date('2025-06-01'),
  user: adminUser,
};

describe('cancelRegistration', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(cancelRegistration({ eventId: 'event-1' })).rejects.toThrow('No autorizado');

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(cancelRegistration({ eventId: 'event-1' })).rejects.toThrow('No autorizado');

    expect(prismaMock.event.findFirst).not.toHaveBeenCalled();
  });

  it('throws when the event is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.findFirst.mockResolvedValue(null);

    await expect(cancelRegistration({ eventId: 'event-1' })).rejects.toThrow(
      'Evento no encontrado',
    );

    expect(prismaMock.eventRegistration.findFirst).not.toHaveBeenCalled();
  });

  it('throws when the registration is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);

    await expect(cancelRegistration({ eventId: 'event-1' })).rejects.toThrow(
      'Inscripción no encontrada o ya cancelada',
    );

    expect(prismaMock.eventRegistration.update).not.toHaveBeenCalled();
  });

  it('marks the registration as cancelled, revalidates path, and returns success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    prismaMock.eventRegistration.findFirst.mockResolvedValue(mockRegistration as any);
    prismaMock.eventRegistration.update.mockResolvedValue({
      ...mockRegistration,
      cancelledAt: new Date(),
    } as any);

    const result = await cancelRegistration({ eventId: 'event-1' });

    expect(result).toEqual({ success: true });
    expect(prismaMock.eventRegistration.update).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
  });
});
