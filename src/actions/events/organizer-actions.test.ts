import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { addEventOrganizer, removeEventOrganizer } from './organizer-actions';

const admin = { id: 'admin-1', role: 'ADMIN' as const, isAmbassador: false };
const ambassador = { id: 'amb-1', role: 'REGULAR' as const, isAmbassador: true };
const organizer = { id: 'org-1', role: 'REGULAR' as const, isAmbassador: false };

const loginAs = (user: { id: string }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const event = { createdById: 'amb-1', deletedAt: null, organizers: [{ userId: 'org-1' }] };

describe('event organizers', () => {
  beforeEach(() => {
    prismaMock.event.findUnique.mockResolvedValue(event as any);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);
  });

  it('lets site admins add any user as organizer', async () => {
    loginAs(admin);

    await addEventOrganizer('event-1', 'user-2');

    expect(prismaMock.eventOrganizer.upsert).toHaveBeenCalledWith({
      where: { eventId_userId: { eventId: 'event-1', userId: 'user-2' } },
      create: { eventId: 'event-1', userId: 'user-2' },
      update: {},
    });
  });

  it('lets the ambassador who created the event manage its organizers', async () => {
    loginAs(ambassador);

    await removeEventOrganizer('event-1', 'org-1');

    expect(prismaMock.eventOrganizer.deleteMany).toHaveBeenCalledWith({
      where: { eventId: 'event-1', userId: 'org-1' },
    });
  });

  it('does not let other organizers change the team', async () => {
    loginAs(organizer);

    await expect(addEventOrganizer('event-1', 'user-2')).rejects.toThrow('No autorizado');
    expect(prismaMock.eventOrganizer.upsert).not.toHaveBeenCalled();
  });

  it('does not add unknown users', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(addEventOrganizer('event-1', 'ghost')).rejects.toThrow('Usuario no encontrado');
    expect(prismaMock.eventOrganizer.upsert).not.toHaveBeenCalled();
  });
});
