import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { sendEmails } from '@/lib/email';
import { createEventAnnouncement, deleteEventAnnouncement } from './event-announcement';

jest.mock('@/lib/email', () => ({ sendEmails: jest.fn(async () => 0) }));
// react-email's render needs ESM dynamic imports, which Jest doesn't run: plain static markup.
jest.mock('@react-email/render', () => ({
  render: async (element: React.ReactElement) =>
    require('react-dom/server').renderToStaticMarkup(element),
}));

type Role = 'ADMIN' | 'REGULAR';
const loginAs = (user: { id: string; role: Role }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({
    id: 's',
    userId: user.id,
    user: { ...user, isAmbassador: false },
  } as any);
};

// The event, as both the permission check and the action read it
const event = (organizers: string[] = []) =>
  ({
    name: 'Meetup',
    deletedAt: null,
    createdById: 'creator',
    organizers: organizers.map((userId) => ({ userId })),
  }) as any;

const input = {
  eventId: 'e1',
  title: 'Cambio de aula',
  content: 'Nos mudamos al aula 204 del segundo piso.',
};

describe('createEventAnnouncement', () => {
  beforeEach(() => {
    prismaMock.announcement.create.mockResolvedValue({ id: 'a1' } as any);
    // The query already leaves out whoever publishes it.
    prismaMock.eventRegistration.findMany.mockResolvedValue([
      { user: { id: 'ana', name: 'Ana López', email: 'ana@example.com' } },
      { user: { id: 'beto', name: 'Beto Paz', email: 'beto@example.com' } },
    ] as any);
  });

  it('refuses members who do not manage the event', async () => {
    loginAs({ id: 'intruso', role: 'REGULAR' });
    prismaMock.event.findUnique.mockResolvedValue(event(['org-1']));

    await expect(createEventAnnouncement(input)).rejects.toThrow('No autorizado');
    expect(prismaMock.announcement.create).not.toHaveBeenCalled();
  });

  it('lets an organizer publish it on the event and notifies everyone signed up but them', async () => {
    loginAs({ id: 'org-1', role: 'REGULAR' });
    prismaMock.event.findUnique.mockResolvedValue(event(['org-1']));

    await expect(createEventAnnouncement({ ...input, pinned: true })).resolves.toEqual({
      id: 'a1',
      notified: 2,
    });

    expect(prismaMock.announcement.create).toHaveBeenCalledWith({
      data: {
        title: 'Cambio de aula',
        content: 'Nos mudamos al aula 204 del segundo piso.',
        pinned: true,
        category: 'evento',
        published: true,
        authorId: 'org-1',
        eventId: 'e1',
      },
    });
    expect(prismaMock.eventRegistration.findMany).toHaveBeenCalledWith({
      where: { eventId: 'e1', cancelledAt: null, userId: { not: 'org-1' } },
      select: { user: { select: { id: true, name: true, email: true } } },
    });
    const { data } = prismaMock.notification.createMany.mock.calls[0][0] as {
      data: { userId: string; title: string; type: string; metadata: string }[];
    };
    expect(data.map((notification) => notification.userId)).toEqual(['ana', 'beto']);
    expect(data[0]).toMatchObject({
      type: 'event_announcement',
      title: 'Nuevo anuncio de Meetup',
    });
    expect(JSON.parse(data[0].metadata)).toMatchObject({ href: '/eventos/e1' });
    const messages = jest.mocked(sendEmails).mock.calls[0][0];
    expect(messages.map((message) => message.to)).toEqual(['ana@example.com', 'beto@example.com']);
    expect(messages[0].subject).toBe('Meetup: Cambio de aula');
    expect(messages[0].html).toContain('Nos mudamos al aula 204 del segundo piso.');
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/e1');
  });

  it('validates the announcement and rejects deleted events', async () => {
    loginAs({ id: 'admin', role: 'ADMIN' });

    await expect(createEventAnnouncement({ ...input, title: 'x' })).rejects.toThrow(
      'El título debe tener al menos 3 caracteres',
    );

    prismaMock.event.findUnique.mockResolvedValue({ ...event(), deletedAt: new Date() });
    await expect(createEventAnnouncement(input)).rejects.toThrow('Evento no encontrado');
    expect(prismaMock.announcement.create).not.toHaveBeenCalled();
  });
});

describe('deleteEventAnnouncement', () => {
  it('lets whoever manages the event delete its announcements', async () => {
    loginAs({ id: 'org-1', role: 'REGULAR' });
    prismaMock.announcement.findUnique.mockResolvedValue({ eventId: 'e1' } as any);
    prismaMock.event.findUnique.mockResolvedValue(event(['org-1']));

    await deleteEventAnnouncement('a1');

    expect(prismaMock.announcement.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/e1');
  });

  it('never deletes general announcements or other events’ ones', async () => {
    loginAs({ id: 'org-1', role: 'REGULAR' });
    prismaMock.announcement.findUnique.mockResolvedValue({ eventId: null } as any);
    await expect(deleteEventAnnouncement('a1')).rejects.toThrow('Anuncio no encontrado');

    prismaMock.announcement.findUnique.mockResolvedValue({ eventId: 'e2' } as any);
    prismaMock.event.findUnique.mockResolvedValue(event(['otra-persona']));
    await expect(deleteEventAnnouncement('a1')).rejects.toThrow('No autorizado');

    expect(prismaMock.announcement.delete).not.toHaveBeenCalled();
  });
});
