/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'a0.muscache.com' },        // Inside Airbnb listing photos
      { protocol: 'https', hostname: 'images.unsplash.com' },    // Hero & placeholder
      { protocol: 'https', hostname: 'airbb.serghini.me' },      // MinIO user uploads
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
}

module.exports = nextConfig
