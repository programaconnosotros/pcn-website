import { createTalk } from './create-talk';
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

// Valid CUID: starts with 'c', at least 8 non-space non-hyphen chars after it
const EVENT_ID = 'cTestEventId1234';

const validData: TalkFormData = {
  title: 'Test Talk Title',
  description: 'A description with at least ten characters.',
  speakers: [
    {
      speakerName: 'John Doe',
      isProfessional: true,
      jobTitle: 'Developer',
      enterprise: 'Acme Corp',
      isStudent: false,
    },
  ],
  order: 0,
};

describe('createTalk', () => {
  it('throws when no sessionId cookie is present', async () => {
    mockCookies();
    await expect(createTalk(validData)).rejects.toThrow('Debes estar autenticado');
  });

  it('throws when session is not found in db', async () => {
    mockCookies({ sessionId: 'session-x' });
    prismaMock.session.findUnique.mockResolvedValue(null);
    await expect(createTalk(validData)).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
  });

  it('throws when user role is not ADMIN', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    await expect(createTalk(validData)).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
  });

  it('throws a validation error when schema parsing fails', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    const invalidData: TalkFormData = { ...validData, title: 'ab' }; // too short (< 3 chars)
    await expect(createTalk(invalidData)).rejects.toThrow(
      'El título debe tener al menos 3 caracteres',
    );
  });

  it('creates talk and revalidates /charlas when no eventId is given', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talk.create.mockResolvedValue({ id: 'talk-1' } as any);

    const result = await createTalk(validData);

    expect(result).toEqual({ success: true, talkId: 'talk-1' });
    expect(revalidatePath).toHaveBeenCalledWith('/charlas');
    expect(revalidatePath).not.toHaveBeenCalledWith(expect.stringContaining('/eventos'));
  });

  it('revalidates event-specific path when eventId is provided', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talk.create.mockResolvedValue({ id: 'talk-2' } as any);

    const result = await createTalk({ ...validData, eventId: EVENT_ID });

    expect(result).toEqual({ success: true, talkId: 'talk-2' });
    expect(revalidatePath).toHaveBeenCalledWith(`/eventos/${EVENT_ID}/charlas`);
    expect(revalidatePath).toHaveBeenCalledWith('/charlas');
  });
});
