import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { deleteRegistration } from './delete-registration';

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

const mockRegistration = {
  id: 'reg-1',
  eventId: 'event-1',
  userId: 'user-admin',
  cancelledAt: null,
  createdAt: new Date('2025-06-01'),
};

describe('deleteRegistration', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(deleteRegistration('reg-1')).rejects.toThrow('No autorizado');

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the session is not found or user is not ADMIN', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue({
      ...adminSession,
      user: { ...adminUser, role: 'REGULAR' as const },
    } as any);

    await expect(deleteRegistration('reg-1')).rejects.toThrow(
      'No tienes permisos para realizar esta acción',
    );

    expect(prismaMock.eventRegistration.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the session is null', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(deleteRegistration('reg-1')).rejects.toThrow(
      'No tienes permisos para realizar esta acción',
    );
  });

  it('throws when the registration is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.eventRegistration.findUnique.mockResolvedValue(null);

    await expect(deleteRegistration('reg-1')).rejects.toThrow('Inscripción no encontrada');

    expect(prismaMock.eventRegistration.delete).not.toHaveBeenCalled();
  });

  it('deletes the registration, revalidates the event path, and returns success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.eventRegistration.findUnique.mockResolvedValue(mockRegistration as any);
    prismaMock.eventRegistration.delete.mockResolvedValue(mockRegistration as any);

    const result = await deleteRegistration('reg-1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.eventRegistration.delete).toHaveBeenCalledWith({
      where: { id: 'reg-1' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
  });
});
