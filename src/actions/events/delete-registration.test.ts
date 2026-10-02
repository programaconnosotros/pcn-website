import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { lockEvent, notifyPromotions, promoteFromWaitlist } from '@/lib/event-waitlist';
import { deleteRegistration } from './delete-registration';

jest.mock('@/lib/event-waitlist', () => ({
  lockEvent: jest.fn(),
  promoteFromWaitlist: jest.fn(),
  notifyPromotions: jest.fn(),
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

const mockRegistration = {
  id: 'reg-1',
  eventId: 'event-1',
  userId: 'user-admin',
  cancelledAt: null,
  createdAt: new Date('2025-06-01'),
};

const lockedEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2099-06-01T21:00:00Z'),
  endDate: null,
  capacity: 2,
  markedAsFull: false,
  externalRegistrationUrl: null,
};

const signedInAsAdmin = () => {
  mockCookies({ sessionId: 'session-admin' });
  prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
  prismaMock.$transaction.mockImplementation(((fn: (_tx: unknown) => unknown) =>
    fn(prismaMock)) as any);
  jest.mocked(lockEvent).mockResolvedValue(lockedEvent as any);
  jest.mocked(promoteFromWaitlist).mockResolvedValue([]);
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
    signedInAsAdmin();
    prismaMock.eventRegistration.findUnique.mockResolvedValue(mockRegistration as any);

    const result = await deleteRegistration('reg-1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.eventRegistration.delete).toHaveBeenCalledWith({
      where: { id: 'reg-1' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
  });

  it('gives the freed spot to the next person waiting', async () => {
    signedInAsAdmin();
    prismaMock.eventRegistration.findUnique.mockResolvedValue(mockRegistration as any);
    const promoted = [
      { registrationId: 'reg-9', userId: 'user-9', userName: 'Ada', userEmail: 'ada@pcn.com' },
    ];
    jest.mocked(promoteFromWaitlist).mockResolvedValue(promoted);

    await deleteRegistration('reg-1');

    expect(promoteFromWaitlist).toHaveBeenCalledWith(prismaMock, lockedEvent);
    expect(notifyPromotions).toHaveBeenCalledWith(lockedEvent, promoted);
  });

  it('does not promote anyone when the deleted registration was already cancelled', async () => {
    signedInAsAdmin();
    prismaMock.eventRegistration.findUnique.mockResolvedValue({
      ...mockRegistration,
      cancelledAt: new Date('2025-06-02'),
    } as any);

    await deleteRegistration('reg-1');

    expect(promoteFromWaitlist).not.toHaveBeenCalled();
    expect(notifyPromotions).not.toHaveBeenCalled();
  });
});
