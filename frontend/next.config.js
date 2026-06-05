/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/proxy/:path*',
        destination: 'https://craft-ai-backend-nu9o.onrender.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
