import prisma from '@/lib/prisma';
import { logClientError, logError } from '@/actions/errors/log-error';
import { fetchErrors, getErrorStats } from '@/actions/errors/fetch-errors';
import { markErrorAsResolved } from '@/actions/errors/mark-as-resolved';
import { actAs } from '@/test/db/fixtures';
import { createAdmin, createUser, uniqueId } from '@/test/db/content-fixtures';

// Registro de errores, su listado paginado y su resolución contra Postgres real.

let admin: Awaited<ReturnType<typeof createAdmin>>;

beforeAll(async () => {
  admin = await createAdmin();
});

describe('logError and logClientError', () => {
  it('stores a server error with its stack and alerts the admins once per message', async () => {
    const user = await createUser();
    const message = `Falló algo ${uniqueId()}`;
    await actAs(user.id);

    await logError(new Error(message), { path: '/eventos', metadata: { eventId: 'x' } });
    await logError(new Error(message), { path: '/eventos' });

    const rows = await prisma.errorLog.findMany({
      where: { message },
      orderBy: { createdAt: 'asc' },
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      userId: user.id,
      path: '/eventos',
      resolved: false,
      metadata: '{"eventId":"x"}',
    });
    expect(rows[0].stack).toContain(message);
    expect(
      await prisma.notification.count({
        where: { userId: admin.id, type: 'server_error', message: { contains: message } },
      }),
    ).toBe(1);
  });

  it('stores non-Error values as text, and client errors without alerting', async () => {
    const message = `cliente ${uniqueId()}`;
    await actAs();

    await logError(`texto ${message}`);
    await logClientError({ message, stack: 'at foo', path: '/x'.repeat(400) });

    const server = await prisma.errorLog.findFirstOrThrow({
      where: { message: `texto ${message}` },
    });
    expect(server.stack).toBeNull();
    const client = await prisma.errorLog.findFirstOrThrow({ where: { message } });
    expect(client).toMatchObject({ stack: 'at foo', userId: null });
    expect(client.path).toHaveLength(500);
    expect(
      await prisma.notification.count({
        where: { type: 'server_error', message: { contains: `(en /x/x` } },
      }),
    ).toBe(0);
  });

  it("does not log admins' errors", async () => {
    const message = `admin ${uniqueId()}`;
    await actAs(admin.id);

    await logError(new Error(message));
    await logClientError({ message });

    expect(await prisma.errorLog.count({ where: { message } })).toBe(0);
  });
});

describe('fetchErrors', () => {
  // Fechas en el futuro: quedan primeras en el listado (más nuevo primero) aunque haya otros errores.
  const marker = uniqueId();

  beforeAll(async () => {
    await prisma.errorLog.createMany({
      data: Array.from({ length: 5 }, (_, i) => ({
        message: `${marker} ${i}`,
        createdAt: new Date(Date.UTC(2099, 0, 1 + i)),
      })),
    });
  });

  it('paginates newest first with the right totals', async () => {
    await actAs(admin.id);
    const total = await prisma.errorLog.count();

    const page1 = await fetchErrors(1, 2);
    const page2 = await fetchErrors(2, 2);

    expect(page1.errors.map((e) => e.message)).toEqual([`${marker} 4`, `${marker} 3`]);
    expect(page2.errors.map((e) => e.message)).toEqual([`${marker} 2`, `${marker} 1`]);
    expect(page1.pagination).toEqual({
      page: 1,
      limit: 2,
      total,
      totalPages: Math.ceil(total / 2),
    });
  });

  it('is only for admins', async () => {
    for (const userId of [(await createUser()).id, undefined]) {
      await actAs(userId);
      await expect(fetchErrors()).rejects.toThrow('No autorizado');
      await expect(getErrorStats()).rejects.toThrow('No autorizado');
    }
  });
});

describe('markErrorAsResolved', () => {
  it('marks the error as resolved by the admin, which shows in the list and stats', async () => {
    const error = await prisma.errorLog.create({
      data: { message: `resolver ${uniqueId()}`, createdAt: new Date(Date.UTC(2100, 0, 1)) },
    });
    await actAs(admin.id);
    const before = await getErrorStats();

    await markErrorAsResolved(error.id);

    const row = await prisma.errorLog.findUniqueOrThrow({ where: { id: error.id } });
    expect(row).toMatchObject({ resolved: true, resolvedBy: admin.id });
    expect(row.resolvedAt).toBeInstanceOf(Date);
    const [listed] = (await fetchErrors(1, 1)).errors;
    expect(listed).toMatchObject({
      id: error.id,
      resolver: { id: admin.id, name: admin.name, email: admin.email },
    });
    expect((await getErrorStats()).unresolvedErrors).toBe(before.unresolvedErrors - 1);
  });

  it('only admins resolve errors', async () => {
    const error = await prisma.errorLog.create({ data: { message: `pendiente ${uniqueId()}` } });

    await actAs((await createUser()).id);
    await expect(markErrorAsResolved(error.id)).rejects.toThrow('Solo los administradores');
    await actAs();
    await expect(markErrorAsResolved(error.id)).rejects.toThrow('No autorizado');

    expect((await prisma.errorLog.findUniqueOrThrow({ where: { id: error.id } })).resolved).toBe(
      false,
    );
  });

  it('fails for a missing error', async () => {
    await actAs(admin.id);
    await expect(markErrorAsResolved('no-existe')).rejects.toThrow();
  });
});
