import { prismaMock } from '@/test/prisma';
import { fetchErrors, getErrorStats } from './fetch-errors';

const sampleError = {
  id: 'error-1',
  message: 'Something broke',
  stack: null,
  path: '/home',
  userId: null,
  userAgent: null,
  ipAddress: null,
  metadata: null,
  resolved: false,
  resolvedAt: null,
  resolvedBy: null,
  createdAt: new Date('2025-06-01'),
  user: null,
  resolver: null,
};

describe('fetchErrors', () => {
  it('uses default page=1 and limit=50 (skip=0, take=50)', async () => {
    prismaMock.errorLog.findMany.mockResolvedValue([sampleError] as any);
    prismaMock.errorLog.count.mockResolvedValue(1);

    const result = await fetchErrors();

    expect(prismaMock.errorLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 50 }),
    );
    expect(result.pagination).toEqual({ page: 1, limit: 50, total: 1, totalPages: 1 });
  });

  it('calculates skip correctly for custom page and limit', async () => {
    prismaMock.errorLog.findMany.mockResolvedValue([] as any);
    prismaMock.errorLog.count.mockResolvedValue(100);

    const result = await fetchErrors(3, 10);

    expect(prismaMock.errorLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
    expect(result.pagination).toEqual({ page: 3, limit: 10, total: 100, totalPages: 10 });
  });

  it('orders results by createdAt descending', async () => {
    prismaMock.errorLog.findMany.mockResolvedValue([] as any);
    prismaMock.errorLog.count.mockResolvedValue(0);

    await fetchErrors();

    expect(prismaMock.errorLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });

  it('includes user and resolver relations', async () => {
    prismaMock.errorLog.findMany.mockResolvedValue([] as any);
    prismaMock.errorLog.count.mockResolvedValue(0);

    await fetchErrors();

    expect(prismaMock.errorLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          user: { select: { id: true, name: true, email: true } },
          resolver: { select: { id: true, name: true, email: true } },
        },
      }),
    );
  });

  it('returns errors alongside pagination metadata', async () => {
    prismaMock.errorLog.findMany.mockResolvedValue([sampleError] as any);
    prismaMock.errorLog.count.mockResolvedValue(1);

    const result = await fetchErrors();

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({ id: 'error-1', message: 'Something broke' });
  });

  it('returns correct totalPages when total is not evenly divisible', async () => {
    prismaMock.errorLog.findMany.mockResolvedValue([] as any);
    prismaMock.errorLog.count.mockResolvedValue(55);

    const result = await fetchErrors(1, 20);

    expect(result.pagination.totalPages).toBe(3);
  });
});

describe('getErrorStats', () => {
  it('returns correct stats aggregating all prisma queries', async () => {
    prismaMock.errorLog.count
      .mockResolvedValueOnce(50) // totalErrors
      .mockResolvedValueOnce(15) // unresolvedErrors
      .mockResolvedValueOnce(3) // errorsToday
      .mockResolvedValueOnce(12); // errorsThisWeek

    const result = await getErrorStats();

    expect(result).toEqual({
      totalErrors: 50,
      unresolvedErrors: 15,
      errorsToday: 3,
      errorsThisWeek: 12,
    });
  });

  it('counts unresolved errors with resolved=false filter', async () => {
    prismaMock.errorLog.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(7);

    await getErrorStats();

    expect(prismaMock.errorLog.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { resolved: false } }),
    );
  });
});
