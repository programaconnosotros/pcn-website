import { prismaMock } from '@/test/prisma';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { sendEmail } from '@/lib/email';
import {
  fillFromWaitlist,
  getWaitlistPosition,
  lockEvent,
  notifyPromotions,
  promoteFromWaitlist,
} from './event-waitlist';

jest.mock('@/actions/notifications/notify-admins', () => ({
  notifyAdmins: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<html />'),
}));

const event = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2099-06-01T21:00:00Z'),
  endDate: null,
  capacity: 2,
  markedAsFull: false,
  externalRegistrationUrl: null,
};

const waitingEntry = (id: string, userId: string) => ({
  id,
  userId,
  user: { name: `Name ${userId}`, email: `${userId}@pcn.com` },
});

const tx = prismaMock as any;

describe('lockEvent', () => {
  it('returns null when the event does not exist or was deleted', async () => {
    prismaMock.$queryRaw.mockResolvedValue([]);

    expect(await lockEvent(tx, 'event-1')).toBeNull();
    expect(prismaMock.event.findUnique).not.toHaveBeenCalled();
  });

  it('returns the event once its row is locked', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ id: 'event-1' }]);
    prismaMock.event.findUnique.mockResolvedValue(event as any);

    expect(await lockEvent(tx, 'event-1')).toEqual(event);
  });
});

describe('promoteFromWaitlist', () => {
  it('promotes people in order until the event is full again', async () => {
    prismaMock.eventRegistration.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    prismaMock.eventRegistration.count.mockResolvedValue(2);
    prismaMock.eventWaitlistEntry.findFirst
      .mockResolvedValueOnce(waitingEntry('wait-1', 'user-1') as any)
      .mockResolvedValueOnce(waitingEntry('wait-2', 'user-2') as any);
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.create
      .mockResolvedValueOnce({ id: 'reg-1' } as any)
      .mockResolvedValueOnce({ id: 'reg-2' } as any);

    const promoted = await promoteFromWaitlist(tx, event);

    expect(promoted.map((p) => p.userId)).toEqual(['user-1', 'user-2']);
    expect(prismaMock.eventWaitlistEntry.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'event-1', cancelledAt: null, promotedAt: null },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(prismaMock.eventWaitlistEntry.update).toHaveBeenCalledWith({
      where: { id: 'wait-1' },
      data: { promotedAt: expect.any(Date) },
    });
  });

  it('stops when nobody is waiting', async () => {
    prismaMock.eventRegistration.count.mockResolvedValue(0);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);

    expect(await promoteFromWaitlist(tx, event)).toEqual([]);
    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
  });

  it('reactivates a cancelled registration instead of creating a new one', async () => {
    prismaMock.eventRegistration.count.mockResolvedValueOnce(1).mockResolvedValue(2);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValueOnce(
      waitingEntry('wait-1', 'user-1') as any,
    );
    prismaMock.eventRegistration.findFirst.mockResolvedValue({
      id: 'reg-old',
      cancelledAt: new Date('2025-01-01'),
    } as any);
    prismaMock.eventRegistration.update.mockResolvedValue({ id: 'reg-old' } as any);

    const promoted = await promoteFromWaitlist(tx, event);

    expect(promoted).toEqual([
      {
        registrationId: 'reg-old',
        userId: 'user-1',
        userName: 'Name user-1',
        userEmail: 'user-1@pcn.com',
      },
    ]);
    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
  });

  it('skips someone who already has a spot and moves on to the next person', async () => {
    prismaMock.eventRegistration.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    prismaMock.eventRegistration.count.mockResolvedValue(2);
    prismaMock.eventWaitlistEntry.findFirst
      .mockResolvedValueOnce(waitingEntry('wait-1', 'user-1') as any)
      .mockResolvedValueOnce(waitingEntry('wait-2', 'user-2') as any);
    prismaMock.eventRegistration.findFirst
      .mockResolvedValueOnce({ id: 'reg-1', cancelledAt: null } as any)
      .mockResolvedValueOnce(null);
    prismaMock.eventRegistration.create.mockResolvedValue({ id: 'reg-2' } as any);

    const promoted = await promoteFromWaitlist(tx, event);

    expect(prismaMock.eventWaitlistEntry.update).toHaveBeenCalledWith({
      where: { id: 'wait-1' },
      data: { cancelledAt: expect.any(Date) },
    });
    expect(promoted.map((p) => p.userId)).toEqual(['user-2']);
  });

  it('promotes everyone waiting when the event no longer has a capacity', async () => {
    prismaMock.eventWaitlistEntry.findFirst
      .mockResolvedValueOnce(waitingEntry('wait-1', 'user-1') as any)
      .mockResolvedValueOnce(null);
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.create.mockResolvedValue({ id: 'reg-1' } as any);

    const promoted = await promoteFromWaitlist(tx, { ...event, capacity: null });

    expect(promoted).toHaveLength(1);
    expect(prismaMock.eventRegistration.count).not.toHaveBeenCalled();
  });

  it.each([
    ['is marked as full by hand', { markedAsFull: true }],
    ['uses an external registration', { externalRegistrationUrl: 'https://lu.ma/x' }],
    ['already ended', { date: new Date('2020-01-01') }],
  ])('promotes nobody when the event %s', async (_label, overrides) => {
    expect(await promoteFromWaitlist(tx, { ...event, ...overrides })).toEqual([]);
    expect(prismaMock.eventWaitlistEntry.findFirst).not.toHaveBeenCalled();
  });
});

describe('getWaitlistPosition', () => {
  it('returns null when the user is not waiting', async () => {
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue(null);

    expect(await getWaitlistPosition('event-1', 'user-1')).toBeNull();
  });

  it('counts the people ahead in the line', async () => {
    const createdAt = new Date('2025-06-01');
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValue({ createdAt } as any);
    prismaMock.eventWaitlistEntry.count.mockResolvedValue(2);

    expect(await getWaitlistPosition('event-1', 'user-1')).toBe(3);
    expect(prismaMock.eventWaitlistEntry.count).toHaveBeenCalledWith({
      where: {
        eventId: 'event-1',
        cancelledAt: null,
        promotedAt: null,
        createdAt: { lt: createdAt },
      },
    });
  });
});

describe('notifyPromotions', () => {
  const promoted = [
    { registrationId: 'reg-1', userId: 'user-1', userName: 'Ada', userEmail: 'ada@pcn.com' },
  ];

  it('emails the promoted person and notifies the admins', async () => {
    await notifyPromotions(event, promoted);

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'ada@pcn.com', subject: expect.stringContaining('Tech Talk') }),
    );
    expect(notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'event_waitlist_promoted' }),
    );
  });

  it('does not throw when the email fails', async () => {
    jest.mocked(sendEmail).mockRejectedValueOnce(new Error('smtp down'));

    await expect(notifyPromotions(event, promoted)).resolves.toBeUndefined();
  });
});

describe('fillFromWaitlist', () => {
  it('locks the event, promotes and notifies', async () => {
    prismaMock.$transaction.mockImplementation(((fn: (_tx: unknown) => unknown) =>
      fn(prismaMock)) as any);
    prismaMock.$queryRaw.mockResolvedValue([{ id: 'event-1' }]);
    prismaMock.event.findUnique.mockResolvedValue(event as any);
    prismaMock.eventRegistration.count.mockResolvedValueOnce(1).mockResolvedValue(2);
    prismaMock.eventWaitlistEntry.findFirst.mockResolvedValueOnce(
      waitingEntry('wait-1', 'user-1') as any,
    );
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.create.mockResolvedValue({ id: 'reg-1' } as any);

    const promoted = await fillFromWaitlist('event-1');

    expect(promoted).toHaveLength(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'user-1@pcn.com' }));
  });

  it('does nothing when the event is gone', async () => {
    prismaMock.$transaction.mockImplementation(((fn: (_tx: unknown) => unknown) =>
      fn(prismaMock)) as any);
    prismaMock.$queryRaw.mockResolvedValue([]);

    expect(await fillFromWaitlist('event-1')).toEqual([]);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
