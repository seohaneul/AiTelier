/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://craftai-backend.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
