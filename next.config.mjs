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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [{ source: '/sponsors', destination: '/partners', permanent: true }];
  },
  images: {
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
      // S3 direct fallback (when CLOUDFRONT_URL is not set)
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
