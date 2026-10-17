import { optimizedOgImage } from './og-image';

describe('optimizedOgImage', () => {
  it('routes the image through the Next image optimizer at 1200px and quality 75', () => {
    const url = new URL(optimizedOgImage('https://cdn.test/flyer.png?v=1&x=2'));
    expect(url.pathname).toBe('/_next/image');
    expect(url.searchParams.get('url')).toBe('https://cdn.test/flyer.png?v=1&x=2');
    expect(url.searchParams.get('w')).toBe('1200');
    expect(url.searchParams.get('q')).toBe('75');
  });

  it('returns an absolute URL on the site', () => {
    expect(optimizedOgImage('/images/logo.png')).toMatch(
      /^https?:\/\/[^/]+\/_next\/image\?url=%2Fimages%2Flogo\.png&w=1200&q=75$/,
    );
  });

  it('accepts a custom width and quality', () => {
    const url = new URL(optimizedOgImage('/a.png', { width: 640, quality: 50 }));
    expect(url.searchParams.get('w')).toBe('640');
    expect(url.searchParams.get('q')).toBe('50');
  });
});
