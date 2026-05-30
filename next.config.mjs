/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Custom loader rewrites listing photos to CDN-resized URLs (see
    // lib/imageLoader.ts): Airbnb muscache /im/?aki_policy and Unsplash native
    // params. The browser fetches the small (~40 KB) image straight from the
    // CDN, bypassing the on-node optimizer — no 15 MB downloads, no transcode
    // load on the single node, and fast for the very first visitor.
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
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
