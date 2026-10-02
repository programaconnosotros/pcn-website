import { generateKeyPairSync, createVerify } from 'node:crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pem = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();

jest.mock('@/lib/s3', () => ({ CLOUDFRONT_URL: 'https://cdn.example.com' }));

const loadSigning = () => {
  process.env.AWS_CLOUDFRONT_KEY_PAIR_ID = 'KTEST';
  process.env.AWS_CLOUDFRONT_PRIVATE_KEY_BASE64 = Buffer.from(pem).toString('base64');
  let signing: typeof import('./gallery-signing');
  jest.isolateModules(() => {
    signing = require('./gallery-signing');
  });
  return signing!;
};

// CloudFront's URL-safe base64: + → -, = → _, / → ~
const fromCloudFrontBase64 = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '=').replace(/~/g, '/'), 'base64');

describe('signGallerySrc', () => {
  const now = new Date('2026-10-01T10:20:00Z').getTime();

  it('signs uploaded gallery photos with a key the public key verifies', () => {
    const { signGallerySrc } = loadSigning();
    const src = 'https://cdn.example.com/gallery/abc/full.webp';

    const { url, expiresAt } = signGallerySrc(src, now);

    const params = new URL(url).searchParams;
    expect(url.startsWith(`${src}?`)).toBe(true);
    expect(params.get('Key-Pair-Id')).toBe('KTEST');
    expect(params.get('Expires')).toBe(String(expiresAt.getTime() / 1000));

    const policy = `{"Statement":[{"Resource":"${src}","Condition":{"DateLessThan":{"AWS:EpochTime":${expiresAt.getTime() / 1000}}}}]}`;
    const verifier = createVerify('RSA-SHA1').update(policy);
    expect(verifier.verify(publicKey, fromCloudFrontBase64(params.get('Signature')!))).toBe(true);
  });

  it('expires at the end of the next hour, so URLs stay stable for an hour', () => {
    const { signGallerySrc } = loadSigning();
    const src = 'https://cdn.example.com/gallery/abc/thumb.webp';

    const first = signGallerySrc(src, now);
    const later = signGallerySrc(src, now + 30 * 60 * 1000);

    expect(first.expiresAt.toISOString()).toBe('2026-10-01T12:00:00.000Z');
    expect(later.url).toBe(first.url);
  });

  it('leaves photos that live in /public untouched', () => {
    const { signGallerySrc, isSignedGallerySrc } = loadSigning();

    expect(signGallerySrc('/photos/agus-talk.webp', now).url).toBe('/photos/agus-talk.webp');
    expect(isSignedGallerySrc('https://cdn.example.com/events/flyer.webp')).toBe(false);
  });
});

describe('signGalleryItem', () => {
  it('adds signed URLs for the thumbnail and the full file, ready to render', () => {
    const { signGalleryItem } = loadSigning();
    const item = {
      id: 'photo-1',
      src: 'https://cdn.example.com/gallery/abc/full.webp',
      thumbSrc: 'https://cdn.example.com/gallery/abc/thumb.webp',
    };

    const signed = signGalleryItem(item);

    expect(signed.id).toBe('photo-1');
    expect(signed.fullUrl).toMatch(
      /^https:\/\/cdn\.example\.com\/gallery\/abc\/full\.webp\?.*Signature=/,
    );
    expect(signed.thumbUrl).toMatch(
      /^https:\/\/cdn\.example\.com\/gallery\/abc\/thumb\.webp\?.*Signature=/,
    );
  });
});
