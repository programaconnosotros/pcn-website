import { notifyAdmins } from '@/actions/notifications/notify-admins';
import {
  alertAdmins,
  alertRateLimitHit,
  alertServerError,
  resetSecurityAlerts,
} from './security-alerts';

jest.mock('@/actions/notifications/notify-admins', () => ({ notifyAdmins: jest.fn() }));

const notifyMock = notifyAdmins as jest.Mock;

beforeEach(() => {
  resetSecurityAlerts();
  jest.useRealTimers();
});

describe('alertAdmins', () => {
  const alert = { type: 't', title: 'Título', message: 'Mensaje' };

  it('notifies the admins once per key per hour', async () => {
    jest.useFakeTimers({ now: new Date('2026-10-04T12:00:00Z') });

    await expect(alertAdmins('k', alert)).resolves.toBe(true);
    await expect(alertAdmins('k', alert)).resolves.toBe(false);
    await expect(alertAdmins('otra', alert)).resolves.toBe(true);
    expect(notifyMock).toHaveBeenCalledTimes(2);

    jest.setSystemTime(new Date('2026-10-04T13:00:01Z'));
    await expect(alertAdmins('k', alert)).resolves.toBe(true);
    expect(notifyMock).toHaveBeenCalledTimes(3);
  });

  it('never throws when the notification fails', async () => {
    notifyMock.mockRejectedValueOnce(new Error('db caída'));

    await expect(alertAdmins('k', alert)).resolves.toBe(false);
  });
});

describe('alertRateLimitHit', () => {
  it.each(['signIn', 'verifyCode', 'sendCode'])('warns about brute force on %s', async (limit) => {
    await alertRateLimitHit(limit, 'ip:203.0.113.7');

    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'security_rate_limit',
        metadata: { limit, identity: 'ip:203.0.113.7' },
      }),
    );
  });

  it('stays quiet for limits that only stop spam', async () => {
    await alertRateLimitHit('comment', 'user:u1');
    await alertRateLimitHit('pageVisit', 'ip:1.2.3.4');

    expect(notifyMock).not.toHaveBeenCalled();
  });
});

describe('alertServerError', () => {
  it('sends the message and where it happened, once per message', async () => {
    await alertServerError('Cannot read properties of undefined', '/eventos/1');
    await alertServerError('Cannot read properties of undefined', '/eventos/2');

    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock.mock.calls[0][0]).toMatchObject({
      type: 'server_error',
      message: expect.stringContaining('(en /eventos/1)'),
    });
  });
});
