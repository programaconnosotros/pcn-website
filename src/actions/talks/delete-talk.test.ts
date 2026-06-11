import { deleteTalk } from './delete-talk';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';

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
const regularUser = { ...adminUser, id: 'user-regular', role: 'REGULAR' as const };
const regularSession = {
  ...adminSession,
  id: 'session-regular',
  userId: 'user-regular',
  user: regularUser,
};

const TALK_ID = 'talk-1';
const EVENT_ID = 'cTestEventId1234';

describe('deleteTalk', () => {
  it('throws when no sessionId cookie is present', async () => {
    mockCookies();
    await expect(deleteTalk(TALK_ID)).rejects.toThrow('Debes estar autenticado');
  });

  it('throws when session is not found in db', async () => {
    mockCookies({ sessionId: 'session-x' });
    prismaMock.session.findUnique.mockResolvedValue(null);
    await expect(deleteTalk(TALK_ID)).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
  });

  it('throws when user role is not ADMIN', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    await expect(deleteTalk(TALK_ID)).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
  });

  it('throws when talk does not exist', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talk.findUnique.mockResolvedValue(null);
    await expect(deleteTalk(TALK_ID)).rejects.toThrow('Charla no encontrada');
  });

  it('deletes talk and revalidates /charlas when talk has no eventId', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talk.findUnique.mockResolvedValue({ id: TALK_ID, eventId: null } as any);
    prismaMock.talk.delete.mockResolvedValue({ id: TALK_ID } as any);

    const result = await deleteTalk(TALK_ID);

    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith('/charlas');
    expect(revalidatePath).not.toHaveBeenCalledWith(expect.stringContaining('/eventos'));
  });

  it('revalidates event-specific path when talk has an eventId', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talk.findUnique.mockResolvedValue({ id: TALK_ID, eventId: EVENT_ID } as any);
    prismaMock.talk.delete.mockResolvedValue({ id: TALK_ID } as any);

    const result = await deleteTalk(TALK_ID);

    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith(`/eventos/${EVENT_ID}/charlas`);
    expect(revalidatePath).toHaveBeenCalledWith('/charlas');
  });
});
