import { APPLE_SPLASH_SIZES, APPLE_STARTUP_IMAGES, parseSplashSize } from './apple-splash';

describe('APPLE_SPLASH_SIZES', () => {
  it('lists the pixel size of each device screen', () => {
    expect(APPLE_SPLASH_SIZES).toContain('1320x2868'); // iPhone 16 Pro Max: 440x956 @3x
    expect(APPLE_SPLASH_SIZES).toContain('640x1136'); // iPhone SE: 320x568 @2x
    expect(APPLE_SPLASH_SIZES.every((size) => /^\d+x\d+$/.test(size))).toBe(true);
  });

  it('has one startup image per size, in portrait', () => {
    expect(APPLE_STARTUP_IMAGES).toHaveLength(APPLE_SPLASH_SIZES.length);
    for (const [index, image] of APPLE_STARTUP_IMAGES.entries()) {
      expect(image.url).toBe(`/apple-splash/${APPLE_SPLASH_SIZES[index]}`);
      expect(image.media).toMatch(/orientation: portrait/);
    }
  });

  it('matches each device by its CSS size and pixel ratio', () => {
    expect(APPLE_STARTUP_IMAGES[0].media).toBe(
      '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
    );
  });
});

describe('parseSplashSize', () => {
  it('splits a size into width and height', () => {
    expect(parseSplashSize('1179x2556')).toEqual({ width: 1179, height: 2556 });
  });

  it('gives NaN for a malformed size', () => {
    expect(parseSplashSize('big')).toEqual({ width: NaN, height: undefined });
  });
});
