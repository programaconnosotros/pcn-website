import { logClientError, logError } from '@/actions/errors/log-error';
import { catchClientError, isRedirectError, withErrorLogging } from './error-handler';

jest.mock('@/actions/errors/log-error', () => ({
  logError: jest.fn(),
  logClientError: jest.fn(),
}));

const mockLogError = logError as jest.Mock;
const mockLogClientError = logClientError as jest.Mock;

describe('withErrorLogging', () => {
  it('returns what the action returns without logging', async () => {
    await expect(withErrorLogging(async () => 42)).resolves.toBe(42);
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('logs the error with its context and rethrows it', async () => {
    const error = new Error('boom');
    const context = { path: '/x', metadata: { a: 1 } };

    await expect(
      withErrorLogging(async () => {
        throw error;
      }, context),
    ).rejects.toBe(error);
    expect(mockLogError).toHaveBeenCalledWith(error, context);
  });
});

describe('catchClientError', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('does nothing on the server', async () => {
    await catchClientError(new Error('x'));
    expect(mockLogClientError).not.toHaveBeenCalled();
  });

  it('sends an Error with its stack and the current path in the browser', async () => {
    (globalThis as { window?: unknown }).window = { location: { pathname: '/eventos' } };
    mockLogClientError.mockResolvedValue(undefined);
    const error = new Error('falló');

    await catchClientError(error, { metadata: { id: 1 } });

    expect(mockLogClientError).toHaveBeenCalledWith({
      message: 'falló',
      stack: error.stack,
      path: '/eventos',
      metadata: { id: 1 },
    });
  });

  it('stringifies non-Error values, prefers the given path and swallows logging failures', async () => {
    (globalThis as { window?: unknown }).window = { location: { pathname: '/eventos' } };
    mockLogClientError.mockRejectedValue(new Error('offline'));

    await expect(catchClientError('texto', { path: '/otro' })).resolves.toBeUndefined();

    expect(mockLogClientError).toHaveBeenCalledWith({
      message: 'texto',
      stack: undefined,
      path: '/otro',
      metadata: undefined,
    });
  });
});

describe('isRedirectError', () => {
  it('is re-exported from Next', () => {
    expect(isRedirectError(new Error('x'))).toBe(false);
  });
});
