// file middleware.ts này sẽ giúp routing dễ hơn tí.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Redirect về login nếu truy cập protected routes mà chưa login
  if (pathname.startsWith('/profile') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect về home nếu đã login mà vào login/register
  if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/login', '/register']
};