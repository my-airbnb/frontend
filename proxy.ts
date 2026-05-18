import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/messages',
  '/admin',
  '/host',
  '/checkout',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get('auth-session')
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/messages/:path*',
    '/admin/:path*',
    '/host/:path*',
    '/checkout/:path*',
  ],
}
