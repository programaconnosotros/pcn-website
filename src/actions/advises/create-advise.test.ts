import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { createAdvise } from './create-advise';

const baseUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hash',
  emailVerified: true,
  role: 'REGULAR' as const,
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

const baseSession = {
  id: 'session-1',
  userId: 'user-1',
  expires: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const validContent = 'Este es un consejo útil con más de 10 caracteres.';

describe('createAdvise', () => {
  it('throws when content fails schema validation', async () => {
    mockCookies({ sessionId: 'session-1' });

    await expect(createAdvise('corto')).rejects.toThrow();

    expect(prismaMock.advise.create).not.toHaveBeenCalled();
  });

  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(createAdvise(validContent)).rejects.toThrow('User not authenticated');

    expect(prismaMock.advise.create).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(createAdvise(validContent)).rejects.toThrow('Session not found');

    expect(prismaMock.advise.create).not.toHaveBeenCalled();
  });

  it('throws when the user is not found in the database', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(createAdvise(validContent)).rejects.toThrow('User not found');

    expect(prismaMock.advise.create).not.toHaveBeenCalled();
  });

  it('creates the advise and revalidates paths on success', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
    prismaMock.advise.create.mockResolvedValue({ id: 'advise-1' } as any);

    await createAdvise(validContent);

    expect(prismaMock.advise.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: validContent,
          author: { connect: { id: 'user-1' } },
        }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/consejos');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });
});
