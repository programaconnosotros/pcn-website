import { prismaMock } from '@/test/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import {
  canManageEventById,
  canManageSomeEvent,
  getEventManager,
  requireEventManager,
} from './event-access';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));

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

describe('canManageSomeEvent shortcuts', () => {
  it('lets admins and ambassadors through without counting, and rejects visitors', async () => {
    await expect(canManageSomeEvent(admin)).resolves.toBe(true);
    await expect(
      canManageSomeEvent({ id: 'amb', role: 'REGULAR', isAmbassador: true }),
    ).resolves.toBe(true);
    await expect(canManageSomeEvent(null)).resolves.toBe(false);
    expect(prismaMock.eventOrganizer.count).not.toHaveBeenCalled();
  });
});

describe('canManageEventById with a missing event', () => {
  it('rejects when the event does not exist', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);
    await expect(canManageEventById(regular, 'gone')).resolves.toBe(false);
  });
});

describe('getEventManager / requireEventManager', () => {
  const mockSession = getCurrentSession as jest.Mock;

  it('returns the logged-in user when they manage the event', async () => {
    mockSession.mockResolvedValue({ user: admin });
    await expect(getEventManager('event-1')).resolves.toBe(admin);
    await expect(requireEventManager(null)).resolves.toBe(admin);
  });

  it('returns null for visitors and for users who do not manage the event', async () => {
    mockSession.mockResolvedValue(null);
    await expect(getEventManager('event-1')).resolves.toBeNull();

    mockSession.mockResolvedValue({ user: regular });
    await expect(getEventManager(null)).resolves.toBeNull();
  });

  it('throws from Server Actions when the caller does not manage the event', async () => {
    mockSession.mockResolvedValue({ user: regular });
    prismaMock.event.findUnique.mockResolvedValue({
      createdById: 'someone',
      deletedAt: null,
      organizers: [],
    } as any);
    await expect(requireEventManager('event-1')).rejects.toThrow('No autorizado');
  });
});
