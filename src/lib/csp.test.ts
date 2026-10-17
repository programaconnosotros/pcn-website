import { buildContentSecurityPolicy, createNonce } from './csp';

const directives = (policy: string) =>
  Object.fromEntries(
    policy.split('; ').map((directive) => {
      const [name, ...values] = directive.split(' ');
      return [name, values];
    }),
  );

describe('buildContentSecurityPolicy', () => {
  it('only runs scripts that carry the nonce of the request', () => {
    const { 'script-src': scripts } = directives(buildContentSecurityPolicy('abc123'));

    expect(scripts).toEqual(["'self'", "'nonce-abc123'", "'strict-dynamic'"]);
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(scripts).not.toContain("'unsafe-eval'");
  });

  it('allows eval only in development, for React and hot reload', () => {
    const { 'script-src': scripts } = directives(buildContentSecurityPolicy('n', { dev: true }));

    expect(scripts).toContain("'unsafe-eval'");
  });

  it('blocks plugins, base tag hijacking, foreign forms and framing by other sites', () => {
    expect(directives(buildContentSecurityPolicy('n'))).toMatchObject({
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'self'"],
      'worker-src': ["'self'", 'blob:'],
    });
  });
});

describe('createNonce', () => {
  it('makes a different 128-bit nonce every time', () => {
    const nonces = new Set(Array.from({ length: 100 }, createNonce));

    expect(nonces.size).toBe(100);
    for (const nonce of nonces) expect(Buffer.from(nonce, 'base64')).toHaveLength(16);
  });
});
