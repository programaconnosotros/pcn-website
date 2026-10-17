import webpush from 'web-push';
import { prismaMock } from '@/test/prisma';
import { sendPush, vapidPublicKey } from './web-push';

jest.mock('web-push', () => ({ __esModule: true, default: { sendNotification: jest.fn() } }));

const send = jest.mocked(webpush.sendNotification);
const payload = { title: 'Nuevo evento', body: 'Meetup', url: '/eventos/e1', tag: 'event_created' };
const subscription = (id: string, endpoint = `https://fcm.googleapis.com/fcm/send/${id}`) => ({
  id,
  endpoint,
  p256dh: `p256dh-${id}`,
  auth: `auth-${id}`,
});

const configure = () => {
  process.env.VAPID_PUBLIC_KEY = 'public-key';
  process.env.VAPID_PRIVATE_KEY = 'private-key';
  process.env.VAPID_SUBJECT = 'mailto:hola@programaconnosotros.com';
};

afterEach(() => {
  delete process.env.VAPID_PUBLIC_KEY;
  delete process.env.VAPID_PRIVATE_KEY;
  delete process.env.VAPID_SUBJECT;
});

it('is off without the three VAPID variables', async () => {
  process.env.VAPID_PUBLIC_KEY = 'public-key';
  expect(vapidPublicKey()).toBeNull();

  await sendPush(['u1'], payload);
  expect(prismaMock.pushSubscription.findMany).not.toHaveBeenCalled();

  configure();
  expect(vapidPublicKey()).toBe('public-key');
});

it("sends the payload to every browser of the recipients, signed with the server's keys", async () => {
  configure();
  prismaMock.pushSubscription.findMany.mockResolvedValue([
    subscription('s1'),
    subscription('s2'),
  ] as never);

  await sendPush(['u1', 'u2'], payload);

  expect(prismaMock.pushSubscription.findMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { userId: { in: ['u1', 'u2'] } } }),
  );
  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledWith(
    {
      endpoint: 'https://fcm.googleapis.com/fcm/send/s1',
      keys: { p256dh: 'p256dh-s1', auth: 'auth-s1' },
    },
    JSON.stringify(payload),
    expect.objectContaining({
      TTL: 86400,
      vapidDetails: {
        subject: 'mailto:hola@programaconnosotros.com',
        publicKey: 'public-key',
        privateKey: 'private-key',
      },
    }),
  );
});

it('forgets the browsers the push service says are gone, and keeps going after other errors', async () => {
  configure();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  prismaMock.pushSubscription.findMany.mockResolvedValue([
    subscription('gone'),
    subscription('expired'),
    subscription('flaky'),
    subscription('ok'),
  ] as never);
  send.mockImplementation(async ({ endpoint }) => {
    if (endpoint.endsWith('gone')) throw Object.assign(new Error('Gone'), { statusCode: 410 });
    if (endpoint.endsWith('expired'))
      throw Object.assign(new Error('Not found'), { statusCode: 404 });
    if (endpoint.endsWith('flaky')) throw Object.assign(new Error('Busy'), { statusCode: 503 });
    return {} as never;
  });

  await expect(sendPush(['u1'], payload)).resolves.toBeUndefined();

  expect(send).toHaveBeenCalledTimes(4);
  expect(prismaMock.pushSubscription.deleteMany).toHaveBeenCalledWith({
    where: { id: { in: ['gone', 'expired'] } },
  });
});

it('never posts to an endpoint outside the push services', async () => {
  configure();
  prismaMock.pushSubscription.findMany.mockResolvedValue([
    subscription('internal', 'https://169.254.169.254/latest/meta-data'),
  ] as never);

  await sendPush(['u1'], payload);

  expect(send).not.toHaveBeenCalled();
});

it('never throws', async () => {
  configure();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  prismaMock.pushSubscription.findMany.mockRejectedValue(new Error('db down'));

  await expect(sendPush(['u1'], payload)).resolves.toBeUndefined();
});
