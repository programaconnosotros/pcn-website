import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { searchCommunityMembers } from './search-community-members';

const loginAs = (role: 'ADMIN' | 'REGULAR') => {
  mockCookies({ sessionId: 'session-1' });
  prismaMock.session.findUnique.mockResolvedValue({
    id: 'session-1',
    userId: 'me',
    user: { id: 'me', name: 'Yo', role },
  } as never);
};

const person = (overrides: Record<string, unknown>) => ({
  id: 'p',
  name: 'Persona',
  image: null,
  email: null,
  slogan: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  positions: [],
  ...overrides,
});

const people = [
  person({ id: 'u-1', name: 'Agustín Sánchez', email: 'agus@mail.com', image: 'a.png' }),
  person({ id: 'u-2', name: 'Bea', positions: [{ jobTitle: 'QA', enterprise: 'Globant' }] }),
  person({ id: 'u-3', name: 'Carla', email: 'secret@mail.com', studyPlace: 'UTN' }),
];

describe('searchCommunityMembers', () => {
  it('requires a logged-in user', async () => {
    mockCookies();

    await expect(searchCommunityMembers('agus')).rejects.toThrow('Debes estar autenticado');
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it('returns nothing for queries shorter than two characters after trimming', async () => {
    loginAs('REGULAR');

    await expect(searchCommunityMembers('  a  ')).resolves.toEqual([]);
    await expect(searchCommunityMembers('')).resolves.toEqual([]);
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it('matches by name, ignoring accents, and returns only public fields', async () => {
    loginAs('REGULAR');
    prismaMock.user.findMany.mockResolvedValue(people as never);

    await expect(searchCommunityMembers('sanc agus')).resolves.toEqual([
      { id: 'u-1', name: 'Agustín Sánchez', image: 'a.png' },
    ]);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      select: expect.objectContaining({ email: false }),
    });
  });

  it('matches by past positions and study place', async () => {
    loginAs('REGULAR');
    prismaMock.user.findMany.mockResolvedValue(people as never);

    await expect(searchCommunityMembers('globant')).resolves.toEqual([
      { id: 'u-2', name: 'Bea', image: null },
    ]);
    await expect(searchCommunityMembers('utn')).resolves.toEqual([
      { id: 'u-3', name: 'Carla', image: null },
    ]);
  });

  it('does not match by email for regular members', async () => {
    loginAs('REGULAR');
    prismaMock.user.findMany.mockResolvedValue(people as never);

    await expect(searchCommunityMembers('secret@')).resolves.toEqual([]);
  });

  it('lets admins match by email', async () => {
    loginAs('ADMIN');
    prismaMock.user.findMany.mockResolvedValue(people as never);

    await expect(searchCommunityMembers('secret@')).resolves.toEqual([
      { id: 'u-3', name: 'Carla', image: null },
    ]);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      select: expect.objectContaining({ email: true }),
    });
  });

  it('returns at most ten matches', async () => {
    loginAs('REGULAR');
    const many = Array.from({ length: 15 }, (_, i) => person({ id: `m-${i}`, name: `Mario ${i}` }));
    prismaMock.user.findMany.mockResolvedValue(many as never);

    await expect(searchCommunityMembers('mario')).resolves.toHaveLength(10);
  });
});
