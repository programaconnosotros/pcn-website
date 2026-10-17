import { logClientError } from '@/actions/errors/log-error';
import { catchClientError, isRedirectError } from './error-handler';

jest.mock('@/actions/errors/log-error', () => ({
  logClientError: jest.fn(),
}));

const mockLogClientError = logClientError as jest.Mock;

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
