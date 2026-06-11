import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { deleteEvent } from './delete-event';

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
  name: 'Some Event',
  deletedAt: null,
};

describe('deleteEvent', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(deleteEvent('event-1')).rejects.toThrow('Usuario no autenticado');

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(deleteEvent('event-1')).rejects.toThrow('Sesión no encontrada');

    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });

  it('throws when the user does not have ADMIN role', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue({
      ...adminSession,
      user: { ...adminUser, role: 'REGULAR' as const },
    } as any);

    await expect(deleteEvent('event-1')).rejects.toThrow(
      'No tienes permisos para eliminar eventos',
    );

    expect(prismaMock.event.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });

  it('throws when the event is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.findUnique.mockResolvedValue(null);

    await expect(deleteEvent('event-1')).rejects.toThrow('Evento no encontrado');

    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });

  it('soft-deletes the event, revalidates /eventos, and redirects on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.event.findUnique.mockResolvedValue(existingEvent as any);
    prismaMock.event.update.mockResolvedValue({ ...existingEvent, deletedAt: new Date() } as any);

    await expect(deleteEvent('event-1')).rejects.toThrow('NEXT_REDIRECT:/eventos');

    expect(prismaMock.event.update).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/eventos');
    expect(redirect).toHaveBeenCalledWith('/eventos');
  });
});
