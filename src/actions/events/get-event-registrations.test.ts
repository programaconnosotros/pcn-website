import { prismaMock } from '@/test/prisma';
import { getEventRegistrations } from './get-event-registrations';
import { requireAdmin } from '@/lib/admin';

// Admin-only data: every test runs as an admin unless it says otherwise.
jest.mock('@/lib/admin', () => ({ requireAdmin: jest.fn() }));

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
  it('rejects anyone who is not an admin', async () => {
    (requireAdmin as jest.Mock).mockRejectedValueOnce(new Error('No autorizado'));

    await expect(getEventRegistrations('event-1')).rejects.toThrow('No autorizado');
  });
});
