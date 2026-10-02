import { lookup } from 'node:dns/promises';
import { isEmbeddable } from './embeddable';

jest.mock('node:dns/promises', () => ({ lookup: jest.fn() }));

const lookupMock = lookup as unknown as jest.Mock;
const fetchMock = jest.fn();

const response = (status: number, headers: Record<string, string> = {}) =>
  ({ status, ok: status >= 200 && status < 300, headers: new Headers(headers), body: null }) as any;

beforeEach(() => {
  global.fetch = fetchMock;
  fetchMock.mockReset();
  lookupMock.mockReset();
  lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
});

describe('isEmbeddable', () => {
  it('accepts a public page without framing restrictions', async () => {
    fetchMock.mockResolvedValue(response(200));

    await expect(isEmbeddable('https://example.com')).resolves.toBe(true);
  });

  it('rejects pages that forbid framing', async () => {
    fetchMock.mockResolvedValue(response(200, { 'x-frame-options': 'DENY' }));
    await expect(isEmbeddable('https://example.com')).resolves.toBe(false);

    fetchMock.mockResolvedValue(
      response(200, { 'content-security-policy': "frame-ancestors 'self'" }),
    );
    await expect(isEmbeddable('https://example.com')).resolves.toBe(false);
  });

  it.each([
    'http://127.0.0.1:3000',
    'http://169.254.169.254/latest/meta-data',
    'http://10.0.0.5',
    'http://192.168.1.1',
    'http://[::1]/',
    'file:///etc/passwd',
  ])('never fetches internal or non-http URLs (%s)', async (url) => {
    await expect(isEmbeddable(url)).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects hosts that resolve to a private address', async () => {
    lookupMock.mockResolvedValue([{ address: '10.1.2.3', family: 4 }]);

    await expect(isEmbeddable('https://sneaky.example')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('checks every redirect hop', async () => {
    fetchMock.mockResolvedValueOnce(response(302, { location: 'http://127.0.0.1/admin' }));

    await expect(isEmbeddable('https://example.com')).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('follows public redirects', async () => {
    fetchMock
      .mockResolvedValueOnce(response(301, { location: '/home' }))
      .mockResolvedValueOnce(response(200));

    await expect(isEmbeddable('https://example.com')).resolves.toBe(true);
    expect(fetchMock.mock.calls[1][0].toString()).toBe('https://example.com/home');
  });
});
