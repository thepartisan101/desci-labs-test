/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'desci.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
