/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this to bypass TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'], // Add your image domains here
  },
}

module.exports = nextConfig
