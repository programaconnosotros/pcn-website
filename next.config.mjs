/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  serverExternalPackages: ['jsdom'],
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
