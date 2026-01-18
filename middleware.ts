import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value

  const protectedRoutes = [
    '/conference',
    '/elearnings',
    '/mylearning',
    '/mypayments',
    '/myprofile',
    '/program',
    '/speakers',
    '/webinar',
    '/workshop',
  ]

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // 🔐 Protect private routes ONLY
  if (isProtected && !accessToken) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/conference/:path*',
    '/elearnings/:path*',
    '/mylearning/:path*',
    '/mypayments/:path*',
    '/myprofile/:path*',
    '/program/:path*',
    '/speakers/:path*',
    '/webinar/:path*',
    '/workshop/:path*',
  ],
}
