import { ImageResponse } from 'next/og';
import { APPLE_SPLASH_SIZES } from '@/lib/apple-splash';
import { dynamic, dynamicParams, GET, generateStaticParams } from './route';

jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation(function (
    this: Record<string, unknown>,
    element: unknown,
    options: unknown,
  ) {
    this.element = element;
    this.options = options;
  }),
}));

const params = (size: string) => ({ params: Promise.resolve({ size }) });

describe('GET /apple-splash/[size]', () => {
  it('is rendered at build time, only for the known sizes', () => {
    expect(dynamic).toBe('force-static');
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toEqual(APPLE_SPLASH_SIZES.map((size) => ({ size })));
  });

  it('renders the splash at the exact size with the logo and the mono font', async () => {
    const response = (await GET(new Request('http://test'), params('1179x2556'))) as unknown as {
      options: { width: number; height: number; fonts: { name: string; data: Buffer }[] };
    };
    expect(ImageResponse).toHaveBeenCalledTimes(1);
    expect(response.options).toMatchObject({ width: 1179, height: 2556 });
    expect(response.options.fonts[0].name).toBe('Geist Mono');
    expect(response.options.fonts[0].data.length).toBeGreaterThan(0);
    expect(JSON.stringify(jest.mocked(ImageResponse).mock.calls[0][0])).toContain(
      'data:image/png;base64,',
    );
  });
});
