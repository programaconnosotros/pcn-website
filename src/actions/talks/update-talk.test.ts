import { updateTalk } from './update-talk';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import type { TalkFormData } from '@/schemas/talk-schema';

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

const existingTalk = {
  id: TALK_ID,
  eventId: EVENT_ID,
  title: 'Old Title',
  description: 'Old description text here.',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const validData: TalkFormData = {
  title: 'Updated Talk Title',
  description: 'An updated description with enough characters.',
  speakers: [
    {
      speakerName: 'Jane Doe',
      isProfessional: true,
      jobTitle: 'Engineer',
      enterprise: 'Tech Corp',
      isStudent: false,
    },
  ],
  order: 1,
};

describe('updateTalk', () => {
  it('throws when no sessionId cookie is present', async () => {
    mockCookies();
    await expect(updateTalk(TALK_ID, validData)).rejects.toThrow('Debes estar autenticado');
  });

  it('throws when session is not found in db', async () => {
    mockCookies({ sessionId: 'session-x' });
    prismaMock.session.findUnique.mockResolvedValue(null);
    await expect(updateTalk(TALK_ID, validData)).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
  });

  it('throws when user role is not ADMIN', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    await expect(updateTalk(TALK_ID, validData)).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
  });

  it('throws when talk does not exist', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talk.findUnique.mockResolvedValue(null);
    await expect(updateTalk(TALK_ID, validData)).rejects.toThrow('Charla no encontrada');
  });

  it('updates talk and revalidates paths on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talk.findUnique.mockResolvedValue(existingTalk as any);
    prismaMock.$transaction.mockResolvedValue([{}, { count: 0 }, { count: 1 }] as any);

    const result = await updateTalk(TALK_ID, validData);

    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith('/charlas');
    expect(revalidatePath).toHaveBeenCalledWith(`/eventos/${EVENT_ID}/charlas`);
  });

  it('falls back to existing eventId for revalidation when new data has no eventId', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talk.findUnique.mockResolvedValue(existingTalk as any);
    prismaMock.$transaction.mockResolvedValue([{}, { count: 0 }, { count: 1 }] as any);

    // validData has no eventId, so existing.eventId should be used
    await updateTalk(TALK_ID, validData);

    expect(revalidatePath).toHaveBeenCalledWith(`/eventos/${EVENT_ID}/charlas`);
    expect(revalidatePath).toHaveBeenCalledWith('/charlas');
  });
});
