import { prismaMock } from '@/test/prisma';
import { fetchLogs, getLogStats } from './fetch-logs';

const sampleLog = {
  id: 'log-1',
  level: 'info',
  message: 'Test log',
  path: '/home',
  userId: null,
  userAgent: null,
  ipAddress: null,
  metadata: null,
  createdAt: new Date('2025-06-01'),
  user: null,
};

describe('fetchLogs', () => {
  it('uses default page=1 and limit=50 (skip=0, take=50)', async () => {
    prismaMock.appLog.findMany.mockResolvedValue([sampleLog] as any);
    prismaMock.appLog.count.mockResolvedValue(1);

    const result = await fetchLogs();

    expect(prismaMock.appLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 50 }),
    );
    expect(result.pagination).toEqual({ page: 1, limit: 50, total: 1, totalPages: 1 });
  });

  it('calculates skip correctly for custom page and limit', async () => {
    prismaMock.appLog.findMany.mockResolvedValue([] as any);
    prismaMock.appLog.count.mockResolvedValue(200);

    const result = await fetchLogs(3, 20);

    expect(prismaMock.appLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 20 }),
    );
    expect(result.pagination).toEqual({ page: 3, limit: 20, total: 200, totalPages: 10 });
  });

  it('passes a level filter to both findMany and count when provided', async () => {
    prismaMock.appLog.findMany.mockResolvedValue([sampleLog] as any);
    prismaMock.appLog.count.mockResolvedValue(1);

    await fetchLogs(1, 50, 'error');

    expect(prismaMock.appLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { level: 'error' } }),
    );
    expect(prismaMock.appLog.count).toHaveBeenCalledWith({ where: { level: 'error' } });
  });

  it('passes an empty where clause when no level is specified', async () => {
    prismaMock.appLog.findMany.mockResolvedValue([] as any);
    prismaMock.appLog.count.mockResolvedValue(0);

    await fetchLogs(1, 50);

    expect(prismaMock.appLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });

  it('includes user relation in the query', async () => {
    prismaMock.appLog.findMany.mockResolvedValue([] as any);
    prismaMock.appLog.count.mockResolvedValue(0);

    await fetchLogs();

    expect(prismaMock.appLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    );
  });

  it('returns logs alongside pagination metadata', async () => {
    prismaMock.appLog.findMany.mockResolvedValue([sampleLog] as any);
    prismaMock.appLog.count.mockResolvedValue(1);

    const result = await fetchLogs();

    expect(result.logs).toHaveLength(1);
    expect(result.logs[0]).toMatchObject({ id: 'log-1', level: 'info' });
  });
});

describe('getLogStats', () => {
  it('returns correct stats aggregating all prisma queries', async () => {
    prismaMock.appLog.count
      .mockResolvedValueOnce(100) // totalLogs
      .mockResolvedValueOnce(5) // logsToday
      .mockResolvedValueOnce(20); // logsThisWeek
    prismaMock.appLog.groupBy.mockResolvedValue([
      { level: 'info', _count: { level: 50 } },
      { level: 'error', _count: { level: 30 } },
      { level: 'warn', _count: { level: 15 } },
      { level: 'debug', _count: { level: 5 } },
    ] as any);

    const result = await getLogStats();

    expect(result).toEqual({
      totalLogs: 100,
      logsToday: 5,
      logsThisWeek: 20,
      logsByLevel: { info: 50, error: 30, warn: 15, debug: 5 },
    });
  });

  it('defaults missing log levels to 0', async () => {
    prismaMock.appLog.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(8);
    prismaMock.appLog.groupBy.mockResolvedValue([{ level: 'info', _count: { level: 10 } }] as any);

    const result = await getLogStats();

    expect(result.logsByLevel).toEqual({ info: 10, warn: 0, error: 0, debug: 0 });
  });
});
