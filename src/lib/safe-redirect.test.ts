import { safeRedirectPath } from './safe-redirect';

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
