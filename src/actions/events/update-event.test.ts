import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import type { EventFormData } from '@/schemas/event-schema';
import { updateEvent } from './update-event';

const validEventData: EventFormData = {
  name: 'Tech Talk Buenos Aires',
  description: 'A great community event about modern software development.',
  date: '2026-08-15T18:00:00.000Z',
  isOnline: false,
  city: 'Buenos Aires',
  placeName: 'GCBA HQ',
  address: 'Diagonal Norte 1234',
  markedAsFull: false,
  callForSpeakersEnabled: false,
  shortcut: '',
};

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

const existingEvent = {
  id: 'event-1',
  name: 'Old Name',
  deletedAt: null,
};

const ambassadorSession = {
  ...adminSession,
  id: 'session-amb',
  userId: 'user-amb',
  user: { ...adminUser, id: 'user-amb', role: 'REGULAR' as const, isAmbassador: true },
};

describe('updateEvent', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(updateEvent('event-1', validEventData)).rejects.toThrow('Usuario no autenticado');

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(updateEvent('event-1', validEventData)).rejects.toThrow('Sesión no encontrada');
  });

  it('rejects regular users who do not administer the event', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue({
      ...adminSession,
      user: { ...adminUser, role: 'REGULAR' as const },
    } as any);
    prismaMock.event.findUnique.mockResolvedValue({ ...existingEvent, organizers: [] } as any);

    await expect(updateEvent('event-1', validEventData)).rejects.toThrow(
      'No tienes permisos para editar este evento',
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('lets any user assigned as event admin edit it', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue({
      ...adminSession,
      user: { ...adminUser, role: 'REGULAR' as const, isAmbassador: false },
    } as any);
    prismaMock.event.findUnique.mockResolvedValue({
      ...existingEvent,
      createdById: null,
      organizers: [{ userId: 'user-admin' }],
    } as any);
    prismaMock.$transaction.mockResolvedValue([] as any);

    await expect(updateEvent('event-1', validEventData)).rejects.toThrow(
      'NEXT_REDIRECT:/eventos/event-1',
    );
  });

  it('throws when the event is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.findUnique.mockResolvedValue(null);

    await expect(updateEvent('event-1', validEventData)).rejects.toThrow('Evento no encontrado');

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('updates the event, revalidates paths, and redirects on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.findUnique.mockResolvedValue(existingEvent as any);
    prismaMock.$transaction.mockResolvedValue([undefined, undefined] as any);

    await expect(updateEvent('event-1', validEventData)).rejects.toThrow(
      'NEXT_REDIRECT:/eventos/event-1',
    );

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/eventos');
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
    expect(redirect).toHaveBeenCalledWith('/eventos/event-1');
  });

  it('rejects ambassadors on events they did not create nor administer', async () => {
    mockCookies({ sessionId: 'session-amb' });
    prismaMock.session.findUnique.mockResolvedValue(ambassadorSession as any);
    prismaMock.event.findUnique.mockResolvedValue({
      ...existingEvent,
      createdById: 'someone-else',
      organizers: [],
    } as any);

    await expect(updateEvent('event-1', validEventData)).rejects.toThrow(
      'No tienes permisos para editar este evento',
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('lets event organizers edit the event without touching its organizers', async () => {
    mockCookies({ sessionId: 'session-amb' });
    prismaMock.session.findUnique.mockResolvedValue(ambassadorSession as any);
    prismaMock.event.findUnique.mockResolvedValue({
      ...existingEvent,
      createdById: 'someone-else',
      organizers: [{ userId: 'user-amb' }],
    } as any);
    prismaMock.$transaction.mockResolvedValue([] as any);

    await expect(updateEvent('event-1', validEventData)).rejects.toThrow(
      'NEXT_REDIRECT:/eventos/event-1',
    );

    expect(prismaMock.eventOrganizer.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ organizers: expect.anything() }),
      }),
    );
  });
});
