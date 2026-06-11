import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { registerEvent } from './register-event';

jest.mock('@/actions/notifications/notify-admins', () => ({
  notifyAdmins: jest.fn().mockResolvedValue(undefined),
}));

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

const mockEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  deletedAt: null,
  capacity: null,
};

describe('registerEvent', () => {
  it('throws when the event is not found', async () => {
    prismaMock.event.findFirst.mockResolvedValue(null);

    await expect(registerEvent('event-1')).rejects.toThrow('Evento no encontrado');

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws when there is no sessionId cookie', async () => {
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    mockCookies();

    await expect(registerEvent('event-1')).rejects.toThrow(
      'Debes estar autenticado para inscribirte a un evento',
    );

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(registerEvent('event-1')).rejects.toThrow(
      'Sesión no válida. Por favor, inicia sesión nuevamente',
    );
  });

  it('throws when the user already has an active registration', async () => {
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.eventRegistration.findFirst.mockResolvedValue({
      id: 'reg-1',
      cancelledAt: null,
    } as any);

    await expect(registerEvent('event-1')).rejects.toThrow('Ya estás registrado en este evento');

    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
  });

  it('creates a new registration and returns success when skipRedirect is true', async () => {
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.create.mockResolvedValue({ id: 'reg-1' } as any);

    const result = await registerEvent('event-1', { skipRedirect: true });

    expect(result).toEqual({ success: true, registrationId: 'reg-1' });
    expect(prismaMock.eventRegistration.create).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
  });

  it('redirects to /eventos/EVENT_ID?registered=true on success', async () => {
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.eventRegistration.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.create.mockResolvedValue({ id: 'reg-2' } as any);

    await expect(registerEvent('event-1')).rejects.toThrow(
      'NEXT_REDIRECT:/eventos/event-1?registered=true',
    );
  });
});
