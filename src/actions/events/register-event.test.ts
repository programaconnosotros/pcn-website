import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { lockEvent, notifyPromotions, promoteFromWaitlist } from '@/lib/event-waitlist';
import { registerEvent } from './register-event';

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

const signedIn = () => {
  mockCookies({ sessionId: 'session-admin' });
  prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
  runTransactions();
  jest.mocked(lockEvent).mockResolvedValue(lockedEvent as any);
  jest.mocked(promoteFromWaitlist).mockResolvedValue([]);
};

describe('registerEvent', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(registerEvent('event-1')).rejects.toThrow(
      'Debes estar autenticado para inscribirte a un evento',
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(registerEvent('event-1')).rejects.toThrow('Sesión no válida');

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('throws when the event is not found', async () => {
    signedIn();
    jest.mocked(lockEvent).mockResolvedValue(null);

    await expect(registerEvent('event-1')).rejects.toThrow('Evento no encontrado');

    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
  });

  it('rejects events whose registration happens on an external site', async () => {
    signedIn();
    jest
      .mocked(lockEvent)
      .mockResolvedValue({ ...lockedEvent, externalRegistrationUrl: 'https://lu.ma/x' } as any);

    await expect(registerEvent('event-1')).rejects.toThrow('sitio externo');
  });

  it('throws when the user already has an active registration', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue({
      id: 'reg-existing',
      cancelledAt: null,
    } as any);

    await expect(registerEvent('event-1')).rejects.toThrow('Ya estás registrado en este evento');

    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
  });

  it('throws when the user is already waiting for a spot', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue({
      id: 'wait-1',
      cancelledAt: null,
      promotedAt: null,
    } as any);

    await expect(registerEvent('event-1')).rejects.toThrow('Ya estás en la lista de espera');

    expect(prismaMock.eventWaitlistEntry.create).not.toHaveBeenCalled();
  });

  it('creates a registration when there is room and notifies the admins', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.count.mockResolvedValue(1);
    prismaMock.eventRegistration.create.mockResolvedValue({ id: 'reg-1' } as any);

    const result = await registerEvent('event-1', { skipRedirect: true });

    expect(result).toEqual({ success: true, status: 'registered', registrationId: 'reg-1' });
    expect(prismaMock.eventRegistration.create).toHaveBeenCalledWith({
      data: { eventId: 'event-1', userId: 'user-admin' },
    });
    expect(notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'event_registration_created' }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
  });

  it('reactivates a previously cancelled registration', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue({
      id: 'reg-old',
      cancelledAt: new Date('2025-05-01'),
    } as any);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.count.mockResolvedValue(0);
    prismaMock.eventRegistration.update.mockResolvedValue({ id: 'reg-old' } as any);

    const result = await registerEvent('event-1', { skipRedirect: true });

    expect(result).toEqual({ success: true, status: 'registered', registrationId: 'reg-old' });
    expect(prismaMock.eventRegistration.update).toHaveBeenCalledWith({
      where: { id: 'reg-old' },
      data: { cancelledAt: null },
    });
  });

  it('adds the user to the waitlist when the event is full', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.count.mockResolvedValue(2);
    const createdAt = new Date('2025-06-01T12:00:00Z');
    prismaMock.eventWaitlistEntry.create.mockResolvedValue({ id: 'wait-1', createdAt } as any);
    prismaMock.eventWaitlistEntry.count.mockResolvedValue(3);

    const result = await registerEvent('event-1', { skipRedirect: true });

    expect(result).toEqual({
      success: true,
      status: 'waitlisted',
      waitlistId: 'wait-1',
      position: 4,
    });
    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
    expect(prismaMock.eventWaitlistEntry.count).toHaveBeenCalledWith({
      where: {
        eventId: 'event-1',
        cancelledAt: null,
        promotedAt: null,
        createdAt: { lt: createdAt },
      },
    });
    expect(notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'event_waitlist_joined' }),
    );
  });

  it('sends people to the waitlist when the event is marked as full by hand', async () => {
    signedIn();
    jest.mocked(lockEvent).mockResolvedValue({ ...lockedEvent, markedAsFull: true } as any);
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.count.mockResolvedValue(0);
    prismaMock.eventWaitlistEntry.create.mockResolvedValue({
      id: 'wait-1',
      createdAt: new Date(),
    } as any);
    prismaMock.eventWaitlistEntry.count.mockResolvedValue(0);

    const result = await registerEvent('event-1', { skipRedirect: true });

    expect(result).toMatchObject({ status: 'waitlisted', position: 1 });
  });

  it('puts someone who left the waitlist back at the end of the line', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue({
      id: 'wait-old',
      cancelledAt: new Date('2025-05-01'),
      promotedAt: null,
    } as any);
    prismaMock.eventRegistration.count.mockResolvedValue(2);
    prismaMock.eventWaitlistEntry.update.mockResolvedValue({
      id: 'wait-old',
      createdAt: new Date(),
    } as any);
    prismaMock.eventWaitlistEntry.count.mockResolvedValue(1);

    await registerEvent('event-1', { skipRedirect: true });

    expect(prismaMock.eventWaitlistEntry.update).toHaveBeenCalledWith({
      where: { id: 'wait-old' },
      data: { cancelledAt: null, promotedAt: null, createdAt: expect.any(Date) },
    });
  });

  it('gives free spots to people already waiting before deciding', async () => {
    signedIn();
    jest.mocked(promoteFromWaitlist).mockResolvedValue([promotedUser]);
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.count.mockResolvedValue(2);
    prismaMock.eventWaitlistEntry.create.mockResolvedValue({
      id: 'wait-1',
      createdAt: new Date(),
    } as any);
    prismaMock.eventWaitlistEntry.count.mockResolvedValue(0);

    await registerEvent('event-1', { skipRedirect: true });

    expect(notifyPromotions).toHaveBeenCalledWith(lockedEvent, [promotedUser]);
  });

  it('turns a unique constraint race into a friendly error', async () => {
    signedIn();
    prismaMock.$transaction.mockRejectedValue(Object.assign(new Error('dup'), { code: 'P2002' }));

    await expect(registerEvent('event-1')).rejects.toThrow(
      'Ya estás inscripto en este evento o en su lista de espera',
    );
  });

  it('redirects to /eventos/EVENT_ID?registered=true on success', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.count.mockResolvedValue(0);
    prismaMock.eventRegistration.create.mockResolvedValue({ id: 'reg-2' } as any);

    await expect(registerEvent('event-1')).rejects.toThrow(
      'NEXT_REDIRECT:/eventos/event-1?registered=true',
    );
  });

  it('redirects to /eventos/EVENT_ID?waitlisted=true when the user ends up waiting', async () => {
    signedIn();
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.count.mockResolvedValue(2);
    prismaMock.eventWaitlistEntry.create.mockResolvedValue({
      id: 'wait-1',
      createdAt: new Date(),
    } as any);
    prismaMock.eventWaitlistEntry.count.mockResolvedValue(0);

    await expect(registerEvent('event-1')).rejects.toThrow(
      'NEXT_REDIRECT:/eventos/event-1?waitlisted=true',
    );
  });
});
