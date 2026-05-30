/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'a0.muscache.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'airbb.serghini.me' },
    ],
    // Serve modern formats — much smaller than JPEG for the same quality.
    formats: ['image/avif', 'image/webp'],
    // Keep optimized images in the on-disk cache for 31 days instead of the
    // 60s default, so a given source image is only fetched + transcoded once.
    // Combined with the persistent .next/cache/images volume, this means an
    // image survives pod restarts / ArgoCD deploys instead of going cold again.
    minimumCacheTTL: 2678400,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://airbb.serghini.me/api/v1/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'https://airbb.serghini.me/ws/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

export default nextConfig
