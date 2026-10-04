import { prismaMock } from '@/test/prisma';
import { fetchSetup, fetchSetups, parseSetupSort, setupSelect } from './setups';

describe('parseSetupSort', () => {
  it('accepts "populares" and defaults everything else to "recientes"', () => {
    expect(parseSetupSort('populares')).toBe('populares');
    expect(parseSetupSort('recientes')).toBe('recientes');
    expect(parseSetupSort('otra')).toBe('recientes');
    expect(parseSetupSort(undefined)).toBe('recientes');
    expect(parseSetupSort(['populares'])).toBe('recientes');
  });
});

describe('fetchSetups', () => {
  beforeEach(() => {
    prismaMock.setup.findMany.mockResolvedValue([]);
  });

  it('sorts by newest by default', async () => {
    await fetchSetups();
    expect(prismaMock.setup.findMany).toHaveBeenCalledWith({
      select: setupSelect,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('sorts by likes, then newest, for "populares"', async () => {
    await fetchSetups('populares');
    expect(prismaMock.setup.findMany).toHaveBeenCalledWith({
      select: setupSelect,
      orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
    });
  });
});

describe('fetchSetup', () => {
  it('finds one setup by id', async () => {
    prismaMock.setup.findUnique.mockResolvedValue({ id: 's1', title: 'Mi setup' } as any);
    await expect(fetchSetup('s1')).resolves.toEqual({ id: 's1', title: 'Mi setup' });
    expect(prismaMock.setup.findUnique).toHaveBeenCalledWith({
      where: { id: 's1' },
      select: setupSelect,
    });
  });

  it('returns null when it does not exist', async () => {
    prismaMock.setup.findUnique.mockResolvedValue(null);
    await expect(fetchSetup('nope')).resolves.toBeNull();
  });
});
