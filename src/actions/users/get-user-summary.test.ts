import { prismaMock } from '@/test/prisma';
import { EMPTY_METRICS } from '@/lib/achievements';
import { getUserAchievementMetrics } from '@/lib/achievement-metrics';
import { getUserSummary } from './get-user-summary';

jest.mock('@/lib/achievement-metrics', () => ({ getUserAchievementMetrics: jest.fn() }));

const baseUser = {
  id: 'user-1',
  name: 'Ada Lovelace',
  image: null,
  slogan: 'printf("hola")',
  jobTitle: 'Old job',
  enterprise: 'Old Co',
  career: 'Sistemas',
  studyPlace: 'UTN',
  province: 'Tucumán',
  countryOfOrigin: 'Argentina',
  isCofounder: false,
  isAmbassador: true,
  createdAt: new Date('2024-03-01T00:00:00Z'),
  positions: [{ jobTitle: 'Staff Engineer', enterprise: 'Acme' }],
  languages: [{ language: 'typescript' }, { language: 'go' }],
};

describe('getUserSummary', () => {
  beforeEach(() => {
    jest
      .mocked(getUserAchievementMetrics)
      .mockResolvedValue({ ...EMPTY_METRICS, talksGiven: 2, commits: 40, contributorRank: 3 });
    prismaMock.advise.count.mockResolvedValue(5);
    prismaMock.galleryItem.count.mockResolvedValue(12);
  });

  it('returns null for unknown users', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    expect(await getUserSummary('ghost')).toBeNull();
  });

  it('ignores empty ids without querying', async () => {
    expect(await getUserSummary('')).toBeNull();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('summarizes the public profile and activity counts', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser as any);

    const summary = await getUserSummary('user-1');

    expect(summary).toMatchObject({
      name: 'Ada Lovelace',
      role: 'Staff Engineer @ Acme',
      location: 'Tucumán, Argentina',
      memberSince: '2024-03-01T00:00:00.000Z',
      isAmbassador: true,
      languages: ['typescript', 'go'],
      stats: { talks: 2, advises: 5, photos: 12, commits: 40, contributorRank: 3 },
    });
    expect(summary?.achievements.total).toBeGreaterThan(0);
    // Nothing private leaks into the card.
    expect(summary).not.toHaveProperty('email');
  });

  it('falls back to the legacy job, then to studies, for the role', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, positions: [] } as any);
    expect((await getUserSummary('user-1'))?.role).toBe('Old job @ Old Co');

    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      positions: [],
      jobTitle: null,
      enterprise: null,
    } as any);
    expect((await getUserSummary('user-1'))?.role).toBe('Sistemas @ UTN');
  });
});
