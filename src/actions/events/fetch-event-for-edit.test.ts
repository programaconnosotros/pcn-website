import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { fetchEventForEdit } from './fetch-event-for-edit';

const admin = { id: 'admin-1', role: 'ADMIN' as const, isAmbassador: false };
const ambassador = { id: 'amb-1', role: 'REGULAR' as const, isAmbassador: true };
const regular = { id: 'user-1', role: 'REGULAR' as const, isAmbassador: false };

const loginAs = (user: typeof admin | typeof regular) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const mockEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2026-08-15'),
  deletedAt: new Date('2026-01-01'),
  createdById: null,
  images: [],
  sponsors: [],
  organizers: [],
};

describe('fetchEventForEdit', () => {
  it('returns the event when found (including soft-deleted events)', async () => {
    loginAs(admin);
    prismaMock.event.findUnique.mockResolvedValue(mockEvent as any);

    const result = await fetchEventForEdit('event-1');

    expect(result).toEqual(mockEvent);
    expect(prismaMock.event.findUnique).toHaveBeenCalledTimes(1);
  });

  it('returns null when the event does not exist', async () => {
    loginAs(admin);
    prismaMock.event.findUnique.mockResolvedValue(null);

    const result = await fetchEventForEdit('non-existent');

    expect(result).toBeNull();
  });
});

describe('fetchEventForEdit access', () => {
  it('rejects anonymous visitors', async () => {
    mockCookies();

    await expect(fetchEventForEdit('event-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.event.findUnique).not.toHaveBeenCalled();
  });

  it('rejects regular users on events they do not administer', async () => {
    loginAs(regular);
    prismaMock.event.findUnique.mockResolvedValue({ ...mockEvent, deletedAt: null } as any);

    await expect(fetchEventForEdit('event-1')).rejects.toThrow('No autorizado');
  });

  it('returns the event to a regular user set as its admin', async () => {
    loginAs(regular);
    const shared = { ...mockEvent, deletedAt: null, organizers: [{ userId: 'user-1' }] };
    prismaMock.event.findUnique.mockResolvedValue(shared as any);

    await expect(fetchEventForEdit('event-1')).resolves.toEqual(shared);
  });

  it('returns the events an ambassador created', async () => {
    loginAs(ambassador);
    const own = { ...mockEvent, deletedAt: null, createdById: 'amb-1' };
    prismaMock.event.findUnique.mockResolvedValue(own as any);

    await expect(fetchEventForEdit('event-1')).resolves.toEqual(own);
  });

  it('rejects ambassadors on events they do not administer', async () => {
    loginAs(ambassador);
    prismaMock.event.findUnique.mockResolvedValue({
      ...mockEvent,
      deletedAt: null,
      createdById: 'someone-else',
    } as any);

    await expect(fetchEventForEdit('event-1')).rejects.toThrow('No autorizado');
  });
});
