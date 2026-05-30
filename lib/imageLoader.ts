// Custom next/image loader.
//
// The seeded listing photos point at Airbnb's CDN originals
// (https://a0.muscache.com/pictures/...) which are full-resolution — up to
// 15 MB each. Optimizing those on our single node meant downloading 15 MB and
// transcoding per image, which is why images crawled in on first load.
//
// The same CDN exposes a resizing endpoint at /im/<path>?aki_policy=<size>
// that returns pre-sized variants (~35–80 KB) directly from Airbnb's global
// CDN. By rewriting URLs here the browser fetches the small image straight from
// the CDN — no big download, no transcode on our node, fast for the first
// visitor. Unsplash is resized via its native query params. Anything else
// (e.g. MinIO uploads) is served unchanged.

interface ImageLoaderArgs {
  src: string
  width: number
  quality?: number
}

export default function cdnImageLoader({ src, width, quality }: ImageLoaderArgs): string {
  // Airbnb muscache CDN → /im/ resizing endpoint.
  if (src.includes('a0.muscache.com')) {
    try {
      const u = new URL(src)
      if (!u.pathname.startsWith('/im/')) {
        u.pathname = '/im' + u.pathname
      }
      u.search = ''
      // aki_policy is reliable across every muscache path shape (im_w 404s on some).
      u.searchParams.set('aki_policy', width > 800 ? 'x_large' : 'large')
      return u.toString()
    } catch {
      return src
    }
  }

  // Unsplash supports native resizing.
  if (src.includes('images.unsplash.com')) {
    try {
      const u = new URL(src)
      u.searchParams.set('w', String(width))
      u.searchParams.set('q', String(quality ?? 75))
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'crop')
      return u.toString()
    } catch {
      return src
    }
  }

  // MinIO uploads / anything else: cannot CDN-resize, serve as-is.
  return src
}
