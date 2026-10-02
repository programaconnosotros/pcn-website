import { prismaMock } from '@/test/prisma';
import { canManageEventById, canManageSomeEvent } from './event-access';

const admin = { id: 'admin', role: 'ADMIN', isAmbassador: false };
const regular = { id: 'reg', role: 'REGULAR', isAmbassador: false };

describe('canManageEventById', () => {
  it('lets site admins manage any event, even without one', async () => {
    await expect(canManageEventById(admin, null)).resolves.toBe(true);
    expect(prismaMock.event.findUnique).not.toHaveBeenCalled();
  });

  it('lets event organizers manage their event', async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      createdById: 'someone',
      deletedAt: null,
      organizers: [{ userId: 'reg' }],
    } as any);

    await expect(canManageEventById(regular, 'event-1')).resolves.toBe(true);
  });

  it('rejects everyone else', async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      createdById: 'someone',
      deletedAt: null,
      organizers: [],
    } as any);

    await expect(canManageEventById(regular, 'event-1')).resolves.toBe(false);
    await expect(canManageEventById(regular, null)).resolves.toBe(false);
    await expect(canManageEventById(null, 'event-1')).resolves.toBe(false);
  });
});

describe('canManageSomeEvent', () => {
  it('counts users who administer at least one event', async () => {
    prismaMock.eventOrganizer.count.mockResolvedValue(1);
    await expect(canManageSomeEvent(regular)).resolves.toBe(true);

    prismaMock.eventOrganizer.count.mockResolvedValue(0);
    await expect(canManageSomeEvent(regular)).resolves.toBe(false);
  });
});
