import prisma from '@/lib/prisma';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { fetchNotifications } from '@/actions/notifications/fetch-notifications';
import { getUnreadNotificationsCount } from '@/actions/notifications/get-unread-count';
import { markNotificationAsRead } from '@/actions/notifications/mark-as-read';
import { markAllNotificationsAsRead } from '@/actions/notifications/mark-all-as-read';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser, uid } from '@/test/db/actions-fixtures';

// Notificaciones de los admins contra Postgres real: a quién llegan y quién puede leerlas.

const notify = (userId: string, overrides: { read?: boolean; createdAt?: Date } = {}) =>
  prisma.notification.create({
    data: { userId, type: 'test', title: 'Aviso', message: `Mensaje ${uid()}`, ...overrides },
  });

describe('notifyAdmins', () => {
  it('creates one unread notification per admin and none for regular users', async () => {
    const [adminA, adminB] = await Promise.all([
      quickUser({ role: 'ADMIN' }),
      quickUser({ role: 'ADMIN' }),
    ]);
    const regular = await quickUser();
    const type = `tipo-${uid()}`;

    await notifyAdmins({ type, title: 'Hola', message: 'Algo pasó', metadata: { foo: 1 } });

    const rows = await prisma.notification.findMany({ where: { type } });
    const recipients = rows.map((row) => row.userId);
    expect(recipients).toEqual(expect.arrayContaining([adminA.id, adminB.id]));
    expect(recipients).not.toContain(regular.id);
    expect(new Set(recipients).size).toBe(rows.length);
    expect(rows.length).toBe(await prisma.user.count({ where: { role: 'ADMIN' } }));
    expect(rows.every((row) => !row.read && row.metadata === '{"foo":1}')).toBe(true);
    // Las notificaciones no vencen lecturas cacheadas
    expect(expiredModel('Notification')).toBe(false);
  });

  it('stores null metadata when none is given', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const type = `tipo-${uid()}`;

    await notifyAdmins({ type, title: 'Hola', message: 'Sin metadata' });

    const [row] = await prisma.notification.findMany({ where: { type, userId: admin.id } });
    expect(row.metadata).toBeNull();
  });
});

describe('fetchNotifications', () => {
  it('returns only the session user’s notifications, newest first', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const other = await quickUser({ role: 'ADMIN' });
    const older = await notify(admin.id, { createdAt: new Date('2024-01-01') });
    const newer = await notify(admin.id, { createdAt: new Date('2024-02-01') });
    await notify(other.id);
    await actAs(admin.id);

    const result = await fetchNotifications();

    expect(result.map((n) => n.id)).toEqual([newer.id, older.id]);
  });

  it('returns nothing to anonymous visitors', async () => {
    await actAs();
    await expect(fetchNotifications()).resolves.toEqual([]);
  });
});

describe('getUnreadNotificationsCount', () => {
  it('counts the admin’s unread notifications only', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const other = await quickUser({ role: 'ADMIN' });
    await notify(admin.id);
    await notify(admin.id);
    await notify(admin.id, { read: true });
    await notify(other.id);
    await actAs(admin.id);

    await expect(getUnreadNotificationsCount()).resolves.toBe(2);
  });

  it('returns 0 for regular users and anonymous visitors', async () => {
    const user = await quickUser();
    await notify(user.id);
    await actAs(user.id);
    await expect(getUnreadNotificationsCount()).resolves.toBe(0);
    await actAs();
    await expect(getUnreadNotificationsCount()).resolves.toBe(0);
  });
});

describe('markNotificationAsRead', () => {
  it('marks the user’s own notification as read', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const notification = await notify(admin.id);
    const untouched = await notify(admin.id);
    await actAs(admin.id);

    await markNotificationAsRead(notification.id);

    expect(
      (await prisma.notification.findUniqueOrThrow({ where: { id: notification.id } })).read,
    ).toBe(true);
    expect(
      (await prisma.notification.findUniqueOrThrow({ where: { id: untouched.id } })).read,
    ).toBe(false);
  });

  it('refuses someone else’s notification, even for an admin', async () => {
    const owner = await quickUser({ role: 'ADMIN' });
    const otherAdmin = await quickUser({ role: 'ADMIN' });
    const notification = await notify(owner.id);
    await actAs(otherAdmin.id);

    await expect(markNotificationAsRead(notification.id)).rejects.toThrow(
      'No tienes permisos para marcar esta notificación como leída',
    );
    expect(
      (await prisma.notification.findUniqueOrThrow({ where: { id: notification.id } })).read,
    ).toBe(false);
  });

  it('fails for an unknown notification and without a session', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);
    await expect(markNotificationAsRead('no-existe')).rejects.toThrow('No tienes permisos');
    await actAs();
    await expect(markNotificationAsRead('no-existe')).rejects.toThrow('No autorizado');
  });
});

describe('markAllNotificationsAsRead', () => {
  it('marks every notification of the session user, leaving other users’ alone', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const other = await quickUser({ role: 'ADMIN' });
    await notify(admin.id);
    await notify(admin.id);
    const othersNotification = await notify(other.id);
    await actAs(admin.id);

    await markAllNotificationsAsRead();

    expect(await prisma.notification.count({ where: { userId: admin.id, read: false } })).toBe(0);
    expect(await prisma.notification.count({ where: { userId: admin.id, read: true } })).toBe(2);
    expect(
      (await prisma.notification.findUniqueOrThrow({ where: { id: othersNotification.id } })).read,
    ).toBe(false);
  });

  it('rejects anonymous visitors', async () => {
    await actAs();
    await expect(markAllNotificationsAsRead()).rejects.toThrow('No autorizado');
  });
});
