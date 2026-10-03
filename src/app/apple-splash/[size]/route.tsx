import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { APPLE_SPLASH_SIZES, parseSplashSize } from '@/lib/apple-splash';

// Launch screens for the app installed on iOS (see src/lib/apple-splash.ts). Rendered once at
// build time: same black background, logo and terminal line as the in-page splash.
export const dynamic = 'force-static';
export const dynamicParams = false;

export const generateStaticParams = () => APPLE_SPLASH_SIZES.map((size) => ({ size }));

const GREEN = '#04f4be';

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const { width, height } = parseSplashSize(size);

  const [icon, font] = await Promise.all([
    readFile(join(process.cwd(), 'public/pwa-icon-512.png')),
    readFile(join(process.cwd(), 'node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf')),
  ]);

  // Proportional to the short side so phones and iPads look alike.
  const unit = Math.min(width, height) / 100;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          fontFamily: 'Geist Mono',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${icon.toString('base64')}`}
          alt=""
          width={unit * 26}
          height={unit * 26}
        />
        <div
          style={{
            display: 'flex',
            marginTop: unit * 6,
            fontSize: unit * 4.2,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          <span style={{ color: GREEN }}>~/pcn $&nbsp;</span>
          <span>iniciando</span>
          <span style={{ color: GREEN }}>_</span>
        </div>
      </div>
    ),
    { width, height, fonts: [{ name: 'Geist Mono', data: font, weight: 400, style: 'normal' }] },
  );
}
