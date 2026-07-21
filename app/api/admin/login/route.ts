import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from '@/lib/admin-auth';

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') || '');
  const requestedNext = String(formData.get('next') || '/admin');
  const nextPath = requestedNext.startsWith('/admin') && !requestedNext.startsWith('/admin/login') ? requestedNext : '/admin';
  const secret = process.env.ADMIN_SECRET;

  if (!secret || !safeEqual(password, secret)) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', '1');
    loginUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(secret), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  });
  return response;
}
