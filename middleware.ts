import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

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

  /**
   * 🔐 HARD LOGOUT
   * No access token → block immediately
   */
  if (isProtected && !accessToken) {
    const res = NextResponse.redirect(
      new URL('/login', request.url)
    )

    // 🔥 clear cookies (best effort)
    res.cookies.set('accessToken', '', {
      path: '/',
      maxAge: 0,
    })
    res.cookies.set('refreshToken', '', {
      path: '/',
      maxAge: 0,
    })

    return res
  }

  /**
   * 🚫 Prevent visiting login when authenticated
   */
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(
      new URL('/mylearning', request.url)
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
    '/login',
  ],
}
