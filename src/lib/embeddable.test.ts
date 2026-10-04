import { isEmbeddable } from './embeddable';
import { safeFetch } from './safe-fetch';

// The SSRF protection (internal addresses, redirects, DNS rebinding) lives in safeFetch and is
// tested in safe-fetch.test.ts; here only the framing decision.
jest.mock('./safe-fetch', () => ({ safeFetch: jest.fn() }));

const safeFetchMock = safeFetch as jest.Mock;

const response = (status: number, headers: Record<string, string> = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  headers: new Headers(headers),
  body: null,
  url: 'https://example.com',
});

describe('isEmbeddable', () => {
  it('accepts a public page without framing restrictions', async () => {
    safeFetchMock.mockResolvedValue(response(200));

    await expect(isEmbeddable('https://example.com')).resolves.toBe(true);
    expect(safeFetchMock).toHaveBeenCalledWith('https://example.com', { maxRedirects: 3 });
  });

  it('rejects pages that forbid framing', async () => {
    safeFetchMock.mockResolvedValue(response(200, { 'x-frame-options': 'DENY' }));
    await expect(isEmbeddable('https://example.com')).resolves.toBe(false);

    safeFetchMock.mockResolvedValue(
      response(200, { 'content-security-policy': "frame-ancestors 'self'" }),
    );
    await expect(isEmbeddable('https://example.com')).resolves.toBe(false);
  });

  it('accepts a CSP that lets any site frame the page', async () => {
    safeFetchMock.mockResolvedValue(
      response(200, { 'content-security-policy': "default-src 'self'; frame-ancestors *" }),
    );

    await expect(isEmbeddable('https://example.com')).resolves.toBe(true);
  });

  it('rejects pages that answer with an error', async () => {
    safeFetchMock.mockResolvedValue(response(404));

    await expect(isEmbeddable('https://example.com')).resolves.toBe(false);
  });

  it('rejects URLs safeFetch refuses (internal addresses, bad schemes, timeouts)', async () => {
    safeFetchMock.mockRejectedValue(new Error('169.254.169.254 apunta a una dirección interna'));

    await expect(isEmbeddable('http://169.254.169.254/latest/meta-data')).resolves.toBe(false);
  });
});
