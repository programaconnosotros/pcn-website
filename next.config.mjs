// Headers de seguridad para todas las respuestas. El sitio se muestra en iframes solo dentro de
// sí mismo (PCN OS abre las páginas en ventanas), así que no se deja embeber desde otros dominios.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: import.meta.dirname,
  },
  serverExternalPackages: ['jsdom'],
  experimental: {
    // Reuse a visited page for 5 minutes instead of asking the server again on every visit, so
    // going back to a tab (the phone tab bar, the profile or interview tabs) is instant, like a
    // native app. Pull to refresh (`router.refresh()`) and server actions that revalidate still
    // fetch fresh data right away.
    staleTimes: { dynamic: 300 },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [{ source: '/sponsors', destination: '/partners', permanent: true }];
  },
  images: {
    // 75 is the default; 40 is for the home hero backdrop, shown faded under gradients.
    qualities: [40, 75],
    remotePatterns: [
      {
        hostname: 'avatars.githubusercontent.com',
        protocol: 'https',
      },
      {
        hostname: 'assets.aceternity.com',
        protocol: 'https',
      },
      {
        hostname: 'images.unsplash.com',
        protocol: 'https',
      },
      // CloudFront CDN for uploaded event flyers / photos
      ...(process.env.AWS_CLOUDFRONT_URL
        ? [{ protocol: 'https', hostname: new URL(process.env.AWS_CLOUDFRONT_URL).hostname }]
        : []),
      // S3 direct fallback (when CLOUDFRONT_URL is not set). Only our bucket: a wildcard over
      // amazonaws.com would let /_next/image proxy and resize images from anyone's bucket.
      ...(process.env.AWS_S3_BUCKET
        ? [
            { protocol: 'https', hostname: `${process.env.AWS_S3_BUCKET}.s3.amazonaws.com` },
            { protocol: 'https', hostname: `${process.env.AWS_S3_BUCKET}.s3.*.amazonaws.com` },
          ]
        : []),
    ],
  },
};

export default nextConfig;
