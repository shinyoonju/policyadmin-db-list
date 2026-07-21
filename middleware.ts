import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === '/admin/login' || pathname === '/api/admin/login';
  if (isLoginRoute) return NextResponse.next();

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: 'ADMIN_SECRET이 설정되지 않아 관리자 접근이 차단되었습니다.' },
      { status: 503 }
    );
  }

  const expectedToken = await createAdminSessionToken(secret);
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (sessionToken === expectedToken) return NextResponse.next();

  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
