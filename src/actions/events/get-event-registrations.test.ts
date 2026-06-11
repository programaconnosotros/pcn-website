import { prismaMock } from '@/test/prisma';
import { getEventRegistrations } from './get-event-registrations';

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
