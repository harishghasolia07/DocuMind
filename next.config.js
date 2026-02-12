/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // External packages for server components (moved out of experimental)
  serverExternalPackages: ['pg'],
};

module.exports = nextConfig;
