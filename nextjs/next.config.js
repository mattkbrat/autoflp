/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'standalone',
  // swcMinify: true,
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'images.unsplash.com', 'drive.google.com'],
  },
};

module.exports = nextConfig;
