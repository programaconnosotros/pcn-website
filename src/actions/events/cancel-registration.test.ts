import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { lockEvent, notifyPromotions, promoteFromWaitlist } from '@/lib/event-waitlist';
import { cancelRegistration } from './cancel-registration';

jest.mock('@/actions/notifications/notify-admins', () => ({
  notifyAdmins: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/event-waitlist', () => ({
  ...jest.requireActual('@/lib/event-waitlist'),
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

const lockedEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2099-06-01T21:00:00Z'),
  endDate: null,
  capacity: 2,
  markedAsFull: false,
  externalRegistrationUrl: null,
};

const promotedUser = {
  registrationId: 'reg-promoted',
  userId: 'user-waiting',
  userName: 'Ada',
  userEmail: 'ada@pcn.com',
};

// Las acciones corren dentro de prisma.$transaction(fn): el mock le pasa el mismo cliente
const runTransactions = () =>
  prismaMock.$transaction.mockImplementation(((fn: (_tx: unknown) => unknown) =>
    fn(prismaMock)) as any);

const mockRegistration = {
  id: 'reg-1',
  eventId: 'event-1',
  userId: 'user-admin',
  cancelledAt: null,
  createdAt: new Date('2025-06-01'),
};

const signedIn = () => {
  mockCookies({ sessionId: 'session-admin' });
  prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
  runTransactions();
  jest.mocked(lockEvent).mockResolvedValue(lockedEvent as any);
  jest.mocked(promoteFromWaitlist).mockResolvedValue([]);
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

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('throws when the event is not found', async () => {
    signedIn();
    jest.mocked(lockEvent).mockResolvedValue(null);

    await expect(cancelRegistration({ eventId: 'event-1' })).rejects.toThrow(
      'Evento no encontrado',
    );

    expect(prismaMock.eventRegistration.findFirst).not.toHaveBeenCalled();
  });

  it('throws when there is neither a registration nor a waitlist entry', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);

    await expect(cancelRegistration({ eventId: 'event-1' })).rejects.toThrow(
      'Inscripción no encontrada o ya cancelada',
    );

    expect(prismaMock.eventRegistration.update).not.toHaveBeenCalled();
    expect(prismaMock.eventWaitlistEntry.update).not.toHaveBeenCalled();
  });

  it('only looks up the given registration when an id is passed', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(mockRegistration as any);

    await cancelRegistration({ eventId: 'event-1', registrationId: 'reg-1' });

    expect(prismaMock.eventRegistration.findFirst).toHaveBeenCalledWith({
      where: { id: 'reg-1', eventId: 'event-1', userId: 'user-admin', cancelledAt: null },
    });
  });

  it('marks the registration as cancelled, revalidates path, and returns success', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(mockRegistration as any);

    const result = await cancelRegistration({ eventId: 'event-1' });

    expect(result).toEqual({ success: true, status: 'cancelled_registration' });
    expect(prismaMock.eventRegistration.update).toHaveBeenCalledWith({
      where: { id: 'reg-1' },
      data: { cancelledAt: expect.any(Date) },
    });
    expect(notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'event_registration_cancelled' }),
    );
    expect(notifyPromotions).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
  });

  it('gives the freed spot to the next person waiting, in the same transaction', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(mockRegistration as any);
    jest.mocked(promoteFromWaitlist).mockResolvedValue([promotedUser]);

    await cancelRegistration({ eventId: 'event-1' });

    expect(promoteFromWaitlist).toHaveBeenCalledWith(prismaMock, lockedEvent);
    expect(notifyPromotions).toHaveBeenCalledWith(lockedEvent, [promotedUser]);
  });

  it('takes the user off the waitlist when they have no registration', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue({ id: 'wait-1' } as any);

    const result = await cancelRegistration({ eventId: 'event-1' });

    expect(result).toEqual({ success: true, status: 'cancelled_waitlist' });
    expect(prismaMock.eventWaitlistEntry.update).toHaveBeenCalledWith({
      where: { id: 'wait-1' },
      data: { cancelledAt: expect.any(Date) },
    });
    expect(promoteFromWaitlist).not.toHaveBeenCalled();
    expect(notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'event_waitlist_cancelled' }),
    );
  });
});
