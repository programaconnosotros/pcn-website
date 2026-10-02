// Generates the PWA and Apple touch icons from public/logo.webp. Run it after changing the
// logo: `pnpm pwa:icons`.
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const LOGO = `${PUBLIC}logo.webp`;
// Same black as the site background and `theme_color`.
const BACKGROUND = '#000000';

// `scale` is the share of the canvas the logo takes. Maskable icons get cropped to a circle
// or squircle by the OS, so the logo has to fit inside the central 80% safe zone.
const ICONS = [
  { file: 'pwa-icon-192.png', size: 192, scale: 0.8, transparent: true },
  { file: 'pwa-icon-512.png', size: 512, scale: 0.8, transparent: true },
  { file: 'pwa-icon-192-maskable.png', size: 192, scale: 0.55 },
  { file: 'pwa-icon-512-maskable.png', size: 512, scale: 0.55 },
  // iOS rounds the corners itself and fills transparency with black, so keep it opaque.
  { file: 'apple-touch-icon.png', size: 180, scale: 0.7 },
];

for (const { file, size, scale, transparent = false } of ICONS) {
  const logoSize = Math.round(size * scale);
  const logo = await sharp(LOGO).resize(logoSize, logoSize, { fit: 'contain' }).toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(`${PUBLIC}${file}`);

  console.log(`public/${file}`);
}
