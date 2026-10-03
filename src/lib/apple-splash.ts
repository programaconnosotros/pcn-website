// iOS ignores the manifest for the launch screen: an installed app shows black until the page
// paints unless there is an `apple-touch-startup-image` whose size matches the device exactly.
// One portrait image per screen, rendered at build time by /apple-splash/[size].

/** CSS viewport (portrait) and pixel ratio of each iPhone / iPad screen size. */
const DEVICES = [
  { width: 440, height: 956, ratio: 3 }, // iPhone 16 Pro Max
  { width: 402, height: 874, ratio: 3 }, // iPhone 16 Pro
  { width: 430, height: 932, ratio: 3 }, // iPhone 14 Pro Max, 15 Plus/Pro Max, 16 Plus
  { width: 393, height: 852, ratio: 3 }, // iPhone 14 Pro, 15, 15 Pro, 16
  { width: 428, height: 926, ratio: 3 }, // iPhone 12/13 Pro Max, 14 Plus
  { width: 390, height: 844, ratio: 3 }, // iPhone 12, 13, 14
  { width: 375, height: 812, ratio: 3 }, // iPhone X, XS, 11 Pro, 12/13 mini
  { width: 414, height: 896, ratio: 3 }, // iPhone XS Max, 11 Pro Max
  { width: 414, height: 896, ratio: 2 }, // iPhone XR, 11
  { width: 414, height: 736, ratio: 3 }, // iPhone 6/7/8 Plus
  { width: 375, height: 667, ratio: 2 }, // iPhone 6/7/8, SE 2/3
  { width: 320, height: 568, ratio: 2 }, // iPhone SE
  { width: 1032, height: 1376, ratio: 2 }, // iPad Pro 13" (M4)
  { width: 1024, height: 1366, ratio: 2 }, // iPad Pro 12.9"
  { width: 834, height: 1210, ratio: 2 }, // iPad Pro 11" (M4)
  { width: 834, height: 1194, ratio: 2 }, // iPad Pro 11"
  { width: 820, height: 1180, ratio: 2 }, // iPad Air, iPad 10
  { width: 834, height: 1112, ratio: 2 }, // iPad Air 3, Pro 10.5"
  { width: 810, height: 1080, ratio: 2 }, // iPad 7–9
  { width: 768, height: 1024, ratio: 2 }, // iPad mini 5, older iPads
  { width: 744, height: 1133, ratio: 2 }, // iPad mini 6
] as const;

export const APPLE_SPLASH_SIZES = DEVICES.map(
  ({ width, height, ratio }) => `${width * ratio}x${height * ratio}`,
);

export const parseSplashSize = (size: string) => {
  const [width, height] = size.split('x').map(Number);
  return { width, height };
};

export const APPLE_STARTUP_IMAGES = DEVICES.map(({ width, height, ratio }) => ({
  url: `/apple-splash/${width * ratio}x${height * ratio}`,
  media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
}));
