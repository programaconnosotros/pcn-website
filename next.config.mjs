/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Normalize case/typo variants of /02A to the canonical short-link
    const variants = ['02a', 'o2A', 'o2a', 'O2A', 'O2a'];
    return variants.map((v) => ({
      source: `/${v}`,
      destination: '/02A',
      permanent: false,
    }));
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
    ],
  },
};

export default nextConfig;
