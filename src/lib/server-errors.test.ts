import { prismaMock } from '@/test/prisma';
import { alertServerError } from '@/lib/security-alerts';
import { recordServerError, resetServerErrorThrottle } from './server-errors';

jest.mock('@/lib/security-alerts', () => ({ alertServerError: jest.fn() }));

const request = {
  path: '/eventos/1',
  method: 'POST',
  headers: { 'user-agent': 'jest', 'x-forwarded-for': '203.0.113.7' },
};
const context = { routerKind: 'App Router', routePath: '/eventos/[id]', routeType: 'action' };

beforeEach(() => resetServerErrorThrottle());

describe('recordServerError', () => {
  it('stores the error with its request and route, and alerts the admins', async () => {
    const error = Object.assign(new Error('boom'), { digest: 'd1' });
    await recordServerError(error, request, context);

    const { data } = prismaMock.errorLog.create.mock.calls[0][0];
    expect(data).toMatchObject({
      message: 'boom',
      path: '/eventos/1',
      userAgent: 'jest',
      ipAddress: '203.0.113.7',
    });
    expect(JSON.parse(data.metadata as string)).toEqual({
      source: 'onRequestError',
      method: 'POST',
      route: '/eventos/[id]',
      routeType: 'action',
      routerKind: 'App Router',
      digest: 'd1',
    });
    expect(alertServerError).toHaveBeenCalledWith('boom', '/eventos/1');
  });

  it('never throws when the database is what failed', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.errorLog.create.mockRejectedValue(new Error('db down'));
    await expect(recordServerError('texto', request, context)).resolves.toBeUndefined();
  });

  it('records at most 30 errors a minute', async () => {
    for (let i = 0; i < 40; i++) await recordServerError(new Error(`e${i}`), request, context);
    expect(prismaMock.errorLog.create).toHaveBeenCalledTimes(30);
  });
});
