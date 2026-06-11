import { prismaMock } from '@/test/prisma';
import { getUsers } from './get-users';

const stubUserWithoutPassword = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@pcn.com',
  emailVerified: true,
  phoneNumber: null,
  role: 'REGULAR' as const,
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
  languages: [{ language: 'TypeScript', color: '#3178c6', logo: 'ts.svg' }],
};

const secondUser = {
  ...stubUserWithoutPassword,
  id: 'user-2',
  name: 'Second User',
  email: 'second@pcn.com',
  createdAt: new Date('2024-12-01'),
  updatedAt: new Date('2024-12-01'),
  languages: [],
};

describe('getUsers', () => {
  it('returns a list of users without the password field', async () => {
    prismaMock.user.findMany.mockResolvedValue([stubUserWithoutPassword] as any);

    const result = await getUsers();

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      select: expect.objectContaining({
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        languages: expect.objectContaining({
          select: { language: true, color: true, logo: true },
        }),
      }),
      orderBy: { createdAt: 'desc' },
    });
    // password must NOT be in the select
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({ password: expect.anything() }),
      }),
    );
    expect(result).toEqual([stubUserWithoutPassword]);
  });

  it('returns multiple users ordered by createdAt descending', async () => {
    prismaMock.user.findMany.mockResolvedValue([stubUserWithoutPassword, secondUser] as any);

    const result = await getUsers();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('user-1');
    expect(result[1].id).toBe('user-2');
  });

  it('returns an empty array when there are no users', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    const result = await getUsers();

    expect(result).toEqual([]);
  });

  it('includes languages for each user', async () => {
    prismaMock.user.findMany.mockResolvedValue([stubUserWithoutPassword] as any);

    const result = await getUsers();

    expect(result[0].languages).toEqual([
      { language: 'TypeScript', color: '#3178c6', logo: 'ts.svg' },
    ]);
  });
});
