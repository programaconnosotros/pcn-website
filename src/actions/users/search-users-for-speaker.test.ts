import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { searchUsersForSpeaker, getUserForSpeaker } from './search-users-for-speaker';

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

const speakerOption = {
  id: 'user-admin',
  name: 'Admin',
  email: 'admin@pcn.com',
  image: null,
  phoneNumber: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
};

const speakerSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  phoneNumber: true,
  jobTitle: true,
  enterprise: true,
  career: true,
  studyPlace: true,
};

describe('searchUsersForSpeaker', () => {
  it('throws "No autorizado" when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(searchUsersForSpeaker('test')).rejects.toThrow('No autorizado');
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it('throws "No autorizado" when the session is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(searchUsersForSpeaker('test')).rejects.toThrow('No autorizado');
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it('throws "No autorizado" for a non-ADMIN user', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(searchUsersForSpeaker('test')).rejects.toThrow('No autorizado');
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it('matches any part of the name, email, slogan, job or studies and drops the extra fields', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.user.findMany.mockResolvedValue([
      { ...speakerOption, slogan: null, positions: [] },
      {
        ...speakerOption,
        id: 'user-2',
        name: 'Agustín Sánchez',
        email: 'agus@mail.com',
        slogan: 'Construyendo cosas',
        positions: [{ jobTitle: 'Dev', enterprise: 'Globant' }],
      },
    ] as any);

    expect((await searchUsersForSpeaker('sanc agus')).map((u) => u.id)).toEqual(['user-2']);
    expect((await searchUsersForSpeaker('globant')).map((u) => u.id)).toEqual(['user-2']);
    expect((await searchUsersForSpeaker('construyendo')).map((u) => u.id)).toEqual(['user-2']);
    expect((await searchUsersForSpeaker('pcn.com')).map((u) => u.id)).toEqual(['user-admin']);
    expect(await searchUsersForSpeaker('admin')).toEqual([speakerOption]);
  });

  it('lists users by name when the query is an empty string', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.user.findMany.mockResolvedValue([speakerOption] as any);

    await searchUsersForSpeaker('');

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: { suspendedAt: null },
      select: speakerSelect,
      orderBy: { name: 'asc' },
      take: 20,
    });
  });

  it('lists users by name when the query is whitespace only', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.user.findMany.mockResolvedValue([]) as any;

    await searchUsersForSpeaker('   ');

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: 'asc' }, take: 20 }),
    );
  });

  it('respects a custom limit', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.user.findMany.mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => ({
        ...speakerOption,
        id: `user-${i}`,
        slogan: null,
        positions: [],
      })) as any,
    );

    expect(await searchUsersForSpeaker('admin', 5)).toHaveLength(5);
  });

  it.each([1_000_000, Infinity, -5, Number.NaN])(
    'caps a limit of %p sent by the browser at 20 results',
    async (limit) => {
      mockCookies({ sessionId: 'session-admin' });
      prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
      prismaMock.user.findMany.mockResolvedValue([]);

      await searchUsersForSpeaker('', limit);

      const { take } = prismaMock.user.findMany.mock.calls[0][0] as { take: number };
      expect(take).toBeGreaterThanOrEqual(1);
      expect(take).toBeLessThanOrEqual(20);
    },
  );
});

describe('getUserForSpeaker', () => {
  it('throws "No autorizado" when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(getUserForSpeaker('user-admin')).rejects.toThrow('No autorizado');
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('throws "No autorizado" when the session is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(getUserForSpeaker('user-admin')).rejects.toThrow('No autorizado');
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('throws "No autorizado" for a non-ADMIN user', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(getUserForSpeaker('user-admin')).rejects.toThrow('No autorizado');
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns the user for a given id when called by an ADMIN', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.user.findUnique.mockResolvedValue(speakerOption as any);

    const result = await getUserForSpeaker('user-admin');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-admin' },
      select: speakerSelect,
    });
    expect(result).toEqual(speakerOption);
  });

  it('returns null when the user does not exist', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await getUserForSpeaker('non-existent');

    expect(result).toBeNull();
  });
});
