import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import type { EventFormData } from '@/schemas/event-schema';
import { createEvent } from './create-event';

// Minimal valid data for an in-person event.
// shortcut must be a string at input time (transforms to undefined when empty).
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

describe('createEvent', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies(); // no sessionId

    await expect(createEvent(validEventData)).rejects.toThrow('Usuario no autenticado');

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(createEvent(validEventData)).rejects.toThrow('Sesión no encontrada');

    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('throws when the user does not have ADMIN role', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue({
      ...adminSession,
      user: { ...adminUser, role: 'REGULAR' as const },
    } as any);

    await expect(createEvent(validEventData)).rejects.toThrow('No tienes permisos');

    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('creates the event, revalidates the path, and redirects on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.create.mockResolvedValue({ id: 'event-1' } as any);

    // redirect() throws to interrupt control flow — the action will reject
    await expect(createEvent(validEventData)).rejects.toThrow('NEXT_REDIRECT:/eventos/event-1');

    expect(prismaMock.event.create).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/eventos');
    expect(redirect).toHaveBeenCalledWith('/eventos/event-1');
  });

  it('passes the event name and date to prisma.event.create', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.create.mockResolvedValue({ id: 'event-2' } as any);

    await expect(createEvent(validEventData)).rejects.toThrow('NEXT_REDIRECT:');

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Tech Talk Buenos Aires',
          city: 'Buenos Aires',
        }),
      }),
    );
  });
});
