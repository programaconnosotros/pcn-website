import { CLOUDFRONT_ORIGIN_SECRET_HEADER, clientIpFrom } from './client-ip';

const store = (values: Record<string, string>) => ({
  get: (name: string) => values[name.toLowerCase()] ?? null,
});

const SECRET = 'shhh-cloudfront';

describe('clientIpFrom', () => {
  const originalSecret = process.env.CLOUDFRONT_ORIGIN_SECRET;

  beforeEach(() => {
    process.env.CLOUDFRONT_ORIGIN_SECRET = SECRET;
  });

  afterAll(() => {
    process.env.CLOUDFRONT_ORIGIN_SECRET = originalSecret;
  });

  it('uses the viewer address CloudFront sends when the origin secret matches', () => {
    const ip = clientIpFrom(
      store({
        [CLOUDFRONT_ORIGIN_SECRET_HEADER]: SECRET,
        'cloudfront-viewer-address': '198.51.100.10:46532',
        'x-forwarded-for': '130.176.0.1',
      }),
    );
    expect(ip).toBe('198.51.100.10');
  });

  it('strips the port from an IPv6 viewer address', () => {
    const ip = clientIpFrom(
      store({
        [CLOUDFRONT_ORIGIN_SECRET_HEADER]: SECRET,
        'cloudfront-viewer-address': '2001:db8:85a3::8a2e:370:7334:46532',
      }),
    );
    expect(ip).toBe('2001:db8:85a3::8a2e:370:7334');
  });

  it('ignores a viewer address sent without the right origin secret', () => {
    const ip = clientIpFrom(
      store({
        [CLOUDFRONT_ORIGIN_SECRET_HEADER]: 'guessed',
        'cloudfront-viewer-address': '6.6.6.6:1234',
        'x-forwarded-for': '6.6.6.6, 9.9.9.9',
      }),
    );
    expect(ip).toBe('9.9.9.9');
  });

  it('ignores the viewer address when no origin secret is configured', () => {
    delete process.env.CLOUDFRONT_ORIGIN_SECRET;
    const ip = clientIpFrom(
      store({
        [CLOUDFRONT_ORIGIN_SECRET_HEADER]: '',
        'cloudfront-viewer-address': '6.6.6.6:1234',
        'x-forwarded-for': '9.9.9.9',
      }),
    );
    expect(ip).toBe('9.9.9.9');
  });

  it('takes the last x-forwarded-for entry, the one kamal-proxy adds', () => {
    expect(clientIpFrom(store({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }))).toBe('2.2.2.2');
  });

  it('falls back to x-real-ip and then to null', () => {
    expect(clientIpFrom(store({ 'x-real-ip': '3.3.3.3' }))).toBe('3.3.3.3');
    expect(clientIpFrom(store({}))).toBeNull();
  });
});
