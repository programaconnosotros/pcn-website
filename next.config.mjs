/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        hostname: 'storage.aceternity.com',
        protocol: 'https',
      },
      {
        hostname: 'sltoipimgzzeegsdygra.supabase.co',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
