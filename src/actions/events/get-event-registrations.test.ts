import { prismaMock } from '@/test/prisma';
import { getEventRegistrations, getEventWaitlist } from './get-event-registrations';
import { requireEventManager } from '@/lib/event-access';

// Event managers only: every test runs as one unless it says otherwise.
jest.mock('@/lib/event-access', () => ({ requireEventManager: jest.fn() }));

const mockUser = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  jobTitle: 'Engineer',
  enterprise: 'Acme',
  career: null,
  studyPlace: null,
};

const mockRegistration = {
  id: 'reg-1',
  eventId: 'event-1',
  userId: 'user-1',
  cancelledAt: null,
  createdAt: new Date('2025-06-01'),
  user: mockUser,
};

describe('getEventRegistrations', () => {
  it('returns mapped registration rows for the given event', async () => {
    prismaMock.eventRegistration.findMany.mockResolvedValue([mockRegistration] as any);

    const result = await getEventRegistrations('event-1');

    expect(result).toEqual([
      {
        id: 'reg-1',
        name: 'Alice',
        email: 'alice@example.com',
        jobTitle: 'Engineer',
        enterprise: 'Acme',
        career: null,
        studyPlace: null,
        cancelledAt: null,
        createdAt: new Date('2025-06-01'),
      },
    ]);
    expect(prismaMock.eventRegistration.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when there are no registrations', async () => {
    prismaMock.eventRegistration.findMany.mockResolvedValue([]);

    const result = await getEventRegistrations('event-1');

    expect(result).toEqual([]);
  });
});

describe('getEventRegistrations access', () => {
  it('rejects anyone who does not manage the event', async () => {
    (requireEventManager as jest.Mock).mockRejectedValueOnce(new Error('No autorizado'));

    await expect(getEventRegistrations('event-1')).rejects.toThrow('No autorizado');
  });
});

describe('getEventWaitlist', () => {
  it('lists the active waitlist in promotion order with 1-based positions', async () => {
    const createdAt = new Date('2025-06-02');
    prismaMock.eventWaitlistEntry.findMany.mockResolvedValue([
      { id: 'w-1', createdAt, user: { name: 'Bea', email: 'bea@x.com' } },
      { id: 'w-2', createdAt, user: { name: 'Caro', email: 'caro@x.com' } },
    ] as any);

    await expect(getEventWaitlist('event-1')).resolves.toEqual([
      { id: 'w-1', position: 1, name: 'Bea', email: 'bea@x.com', createdAt },
      { id: 'w-2', position: 2, name: 'Caro', email: 'caro@x.com', createdAt },
    ]);
    expect(requireEventManager).toHaveBeenCalledWith('event-1');
    expect(prismaMock.eventWaitlistEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
    );
  });

  it('rejects anyone who does not manage the event', async () => {
    (requireEventManager as jest.Mock).mockRejectedValueOnce(new Error('No autorizado'));

    await expect(getEventWaitlist('event-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.eventWaitlistEntry.findMany).not.toHaveBeenCalled();
  });
});
