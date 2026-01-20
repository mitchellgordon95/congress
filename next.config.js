/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bioguide.congress.gov',
        pathname: '/bioguide/photo/**',
      },
      {
        protocol: 'https',
        hostname: 'www.congress.gov',
        pathname: '/img/member/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
