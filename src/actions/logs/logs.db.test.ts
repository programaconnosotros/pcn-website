import prisma from '@/lib/prisma';
import { logClient } from '@/actions/logs/log-client';
import { fetchLogs, getLogStats } from '@/actions/logs/fetch-logs';
import { actAs } from '@/test/db/fixtures';
import { createAdmin, createUser, daysFromNow, uniqueId } from '@/test/db/content-fixtures';

// Logs del cliente y su listado paginado contra Postgres real.

describe('logClient', () => {
  it('stores the log with the member, request data and clipped fields', async () => {
    const user = await createUser();
    const message = `log-${uniqueId()}`;
    await actAs(user.id);

    await logClient({
      level: 'warn',
      message: message + 'x'.repeat(3000),
      path: `/${'p'.repeat(800)}`,
      metadata: { big: 'm'.repeat(20000) },
    });

    const [log] = await prisma.appLog.findMany({ where: { message: { startsWith: message } } });
    expect(log).toMatchObject({
      level: 'warn',
      userId: user.id,
      userAgent: 'jest',
      ipAddress: '203.0.113.7',
    });
    expect(log.message).toHaveLength(2000);
    expect(log.path).toHaveLength(500);
    expect(log.metadata).toHaveLength(10000);
  });

  it('stores anonymous logs and skips the ones of admins', async () => {
    const admin = await createAdmin();
    const message = `log-${uniqueId()}`;

    await actAs();
    await logClient({ level: 'info', message });
    await actAs(admin.id);
    await logClient({ level: 'info', message });

    expect((await prisma.appLog.findMany({ where: { message } })).map((l) => l.userId)).toEqual([
      null,
    ]);
  });
});

describe('fetchLogs', () => {
  // Un nivel propio: el filtro deja solo los logs de este test aunque la tabla tenga otros.
  const level = `nivel-${uniqueId()}`;
  let admin: Awaited<ReturnType<typeof createAdmin>>;

  beforeAll(async () => {
    admin = await createAdmin();
    await prisma.appLog.createMany({
      data: Array.from({ length: 7 }, (_, i) => ({
        level,
        message: `log ${i}`,
        createdAt: new Date(Date.UTC(2024, 0, 1 + i)),
      })),
    });
  });

  it('paginates newest first with the right totals', async () => {
    await actAs(admin.id);

    const page1 = await fetchLogs(1, 3, level);
    const page3 = await fetchLogs(3, 3, level);

    expect(page1.logs.map((l) => l.message)).toEqual(['log 6', 'log 5', 'log 4']);
    expect(page1.pagination).toEqual({ page: 1, limit: 3, total: 7, totalPages: 3 });
    expect(page3.logs.map((l) => l.message)).toEqual(['log 0']);
    expect((await fetchLogs(4, 3, level)).logs).toEqual([]);
  });

  it('includes the member of each log', async () => {
    const user = await createUser();
    const ownLevel = `nivel-${uniqueId()}`;
    await prisma.appLog.create({
      data: { level: ownLevel, message: 'con usuario', userId: user.id },
    });
    await actAs(admin.id);

    const { logs } = await fetchLogs(1, 10, ownLevel);
    expect(logs[0].user).toEqual({ id: user.id, name: user.name, email: user.email });
  });

  it('counts logs by level and period', async () => {
    await actAs(admin.id);
    const before = await getLogStats();
    await prisma.appLog.createMany({
      data: [
        { level: 'error', message: 'hoy' },
        { level: 'warn', message: 'hoy' },
        { level: 'debug', message: 'hace 3 días', createdAt: daysFromNow(-3) },
      ],
    });

    const after = await getLogStats();
    expect(after.totalLogs - before.totalLogs).toBe(3);
    expect(after.logsThisWeek - before.logsThisWeek).toBe(3);
    expect(after.logsToday - before.logsToday).toBe(2);
    expect(after.logsByLevel.error - before.logsByLevel.error).toBe(1);
    expect(after.logsByLevel.warn - before.logsByLevel.warn).toBe(1);
    expect(after.logsByLevel.debug - before.logsByLevel.debug).toBe(1);
  });

  it('is only for admins', async () => {
    for (const userId of [(await createUser()).id, undefined]) {
      await actAs(userId);
      await expect(fetchLogs(1, 3, level)).rejects.toThrow('No autorizado');
      await expect(getLogStats()).rejects.toThrow('No autorizado');
    }
  });
});
