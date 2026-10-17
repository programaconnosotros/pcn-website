import { randomBytes } from 'node:crypto';
import prisma from '@/lib/prisma';
import { actAs } from '@/test/db/fixtures';
import { quickUser } from '@/test/db/actions-fixtures';
import { deletePushSubscription, savePushSubscription } from './push-subscriptions';

// Turning push notifications on and off against a real Postgres.

const browser = () => ({
  endpoint: `https://fcm.googleapis.com/fcm/send/${randomBytes(8).toString('hex')}`,
  keys: {
    p256dh: randomBytes(65).toString('base64url'),
    auth: randomBytes(16).toString('base64url'),
  },
});

it('saves a browser for the signed-in member, and hands it over when someone else signs in', async () => {
  const [ana, beto] = [await quickUser(), await quickUser()];
  const subscription = browser();

  await actAs(ana.id);
  await savePushSubscription(subscription);
  await savePushSubscription(subscription);
  expect(
    await prisma.pushSubscription.findMany({ where: { endpoint: subscription.endpoint } }),
  ).toEqual([expect.objectContaining({ userId: ana.id, p256dh: subscription.keys.p256dh })]);

  await actAs(beto.id);
  await savePushSubscription(subscription);
  expect(
    await prisma.pushSubscription.findUniqueOrThrow({ where: { endpoint: subscription.endpoint } }),
  ).toMatchObject({ userId: beto.id });
});

it('only accepts the browsers push services, and only from members', async () => {
  const member = await quickUser();

  await actAs();
  await expect(savePushSubscription(browser())).rejects.toThrow('Debes estar autenticado');

  await actAs(member.id);
  for (const endpoint of ['https://169.254.169.254/latest', 'http://fcm.googleapis.com/x']) {
    await expect(savePushSubscription({ ...browser(), endpoint })).rejects.toThrow(
      'Suscripción inválida',
    );
  }
  await expect(
    savePushSubscription({ ...browser(), keys: { p256dh: '<script>', auth: 'x' } }),
  ).rejects.toThrow('Suscripción inválida');
  expect(await prisma.pushSubscription.count({ where: { userId: member.id } })).toBe(0);
});

it('lets members turn off only their own browsers', async () => {
  const [ana, beto] = [await quickUser(), await quickUser()];
  const subscription = browser();
  await actAs(ana.id);
  await savePushSubscription(subscription);

  await actAs(beto.id);
  await deletePushSubscription(subscription.endpoint);
  expect(await prisma.pushSubscription.count({ where: { userId: ana.id } })).toBe(1);

  await actAs(ana.id);
  await deletePushSubscription(subscription.endpoint);
  expect(await prisma.pushSubscription.count({ where: { userId: ana.id } })).toBe(0);
});

it('goes away with the account', async () => {
  const member = await quickUser();
  await actAs(member.id);
  await savePushSubscription(browser());

  await prisma.user.delete({ where: { id: member.id } });

  expect(await prisma.pushSubscription.count({ where: { userId: member.id } })).toBe(0);
});
