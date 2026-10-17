import { recordServerError } from '@/lib/server-errors';
import { onRequestError } from './instrumentation';

jest.mock('@/lib/server-errors', () => ({ recordServerError: jest.fn() }));

const request = { path: '/x', method: 'GET', headers: {} };
const context = { routerKind: 'App Router', routePath: '/x', routeType: 'render' };
const env = process.env as Record<string, string | undefined>;

describe('onRequestError', () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it('records request errors in production on the Node runtime', async () => {
    env.NODE_ENV = 'production';
    env.NEXT_RUNTIME = 'nodejs';
    const error = new Error('render');
    await onRequestError(error, request, context);
    expect(recordServerError).toHaveBeenCalledWith(error, request, context);
  });

  it('leaves dev and the edge runtime alone', async () => {
    env.NODE_ENV = 'development';
    env.NEXT_RUNTIME = 'nodejs';
    await onRequestError(new Error('x'), request, context);
    env.NODE_ENV = 'production';
    env.NEXT_RUNTIME = 'edge';
    await onRequestError(new Error('x'), request, context);
    expect(recordServerError).not.toHaveBeenCalled();
  });
});
