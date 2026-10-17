import { isSitePath, safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
  it.each(['/eventos/abc', '/eventos/abc/proponer-charla?autoRegister=true', '/perfil#datos'])(
    'keeps the same-site path %s',
    (path) => {
      expect(safeRedirectPath(path)).toBe(path);
    },
  );

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/\\/evil.example',
    'javascript:alert(1)',
    'eventos',
  ])('rejects %s', (value) => {
    expect(safeRedirectPath(value)).toBe('/');
  });

  it('returns the fallback when there is no value', () => {
    expect(safeRedirectPath(null, '')).toBe('');
    expect(safeRedirectPath(undefined)).toBe('/');
  });
});

it('returns the fallback for paths the URL parser rejects', () => {
  expect(safeRedirectPath('//[', '/inicio')).toBe('/inicio');
});

describe('isSitePath', () => {
  it.each([
    '/',
    '/eventos',
    '/perfil/clx123abc',
    '/cowork',
    '/%2F%2Fevil',
    '/charlas/introducción',
  ])('accepts the site path %s', (path) => {
    expect(isSitePath(path)).toBe(true);
  });

  it.each([
    '//open-redirect-landing.vercel.app/',
    '/\\open-redirect-landing.vercel.app/',
    'https://evil.example',
    'javascript:alert(1)',
    '/eventos?x=1',
    '/eventos#x',
    '/a b',
    '/<script>',
    'eventos',
    '',
  ])('rejects %s', (value) => {
    expect(isSitePath(value)).toBe(false);
  });

  it('rejects values that are not strings or are too long', () => {
    expect(isSitePath(42)).toBe(false);
    expect(isSitePath(null)).toBe(false);
    expect(isSitePath(`/${'a'.repeat(600)}`)).toBe(false);
    expect(isSitePath('/abc', 3)).toBe(false);
  });
});
