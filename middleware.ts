import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

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

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/mylearning', request.url))
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
    '/login',
  ],
}