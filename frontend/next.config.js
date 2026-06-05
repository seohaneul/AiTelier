/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/proxy/:path*',
        destination: 'https://craftai-backend.onrender.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
