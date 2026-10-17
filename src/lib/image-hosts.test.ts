import { canOptimizeImage } from './image-hosts';

const env = { AWS_CLOUDFRONT_URL: 'https://d123.cloudfront.net', AWS_S3_BUCKET: 'pcn-uploads' };

describe('canOptimizeImage', () => {
  it('allows the hosts next.config.mjs lets /_next/image fetch', () => {
    expect(canOptimizeImage('https://d123.cloudfront.net/u/a.jpg', env)).toBe(true);
    expect(canOptimizeImage('https://pcn-uploads.s3.amazonaws.com/a.jpg', env)).toBe(true);
    expect(canOptimizeImage('https://pcn-uploads.s3.sa-east-1.amazonaws.com/a.jpg', env)).toBe(
      true,
    );
    expect(canOptimizeImage('https://avatars.githubusercontent.com/u/1', env)).toBe(true);
    expect(canOptimizeImage('/images/a.png', env)).toBe(true);
  });

  it('leaves everything else as a plain image', () => {
    expect(canOptimizeImage(null, env)).toBe(false);
    expect(canOptimizeImage('https://lh3.googleusercontent.com/a/x', env)).toBe(false);
    expect(canOptimizeImage('http://d123.cloudfront.net/u/a.jpg', env)).toBe(false);
    expect(canOptimizeImage('//d123.cloudfront.net/u/a.jpg', env)).toBe(false);
    expect(canOptimizeImage('https://other.s3.amazonaws.com/a.jpg', env)).toBe(false);
    // The pattern's `*` is a single label
    expect(canOptimizeImage('https://pcn-uploads.s3.a.b.amazonaws.com/a.jpg', env)).toBe(false);
    expect(canOptimizeImage('not a url', env)).toBe(false);
  });

  it('allows no bucket or CDN when they are not configured', () => {
    expect(canOptimizeImage('https://d123.cloudfront.net/u/a.jpg', {})).toBe(false);
    expect(canOptimizeImage('https://pcn-uploads.s3.amazonaws.com/a.jpg', {})).toBe(false);
  });
});
