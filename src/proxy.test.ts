import { NextRequest } from 'next/server';
import { config, proxy } from './proxy';

describe('proxy', () => {
  it('sends the same nonce to the page (request) and to the browser (response CSP)', () => {
    const response = proxy(new NextRequest('https://programaconnosotros.com/eventos'));

    const policy = response.headers.get('content-security-policy') ?? '';
    const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
    expect(nonce).toBeTruthy();
    expect(response.headers.get('x-middleware-request-x-nonce')).toBe(nonce);
    expect(response.headers.get('x-middleware-request-content-security-policy')).toBe(policy);
  });

  it('uses a new nonce on every request', () => {
    const policy = () =>
      proxy(new NextRequest('https://programaconnosotros.com/')).headers.get(
        'content-security-policy',
      );

    expect(policy()).not.toBe(policy());
  });

  it('runs on pages but not on static files, images or the API', () => {
    const [{ source }] = config.matcher;
    const matches = (path: string) => new RegExp(`^${source}$`).test(path);

    for (const page of ['/', '/eventos', '/eventos/abc123', '/desarrollo/calidad']) {
      expect(matches(page)).toBe(true);
    }
    for (const file of [
      '/api/search',
      '/_next/static/chunk.js',
      '/_next/image',
      '/sw.js',
      '/logo.png',
    ]) {
      expect(matches(file)).toBe(false);
    }
  });
});
