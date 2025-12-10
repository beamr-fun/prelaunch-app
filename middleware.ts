import * as jose from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { env } from './lib/env';

export const config = {
  matcher: ['/api/:path*'],
};

export default async function middleware(req: NextRequest) {
  // Skip auth check for sign-in endpoint
  if (
    req.nextUrl.pathname === '/api/auth/sign-in' ||
    req.nextUrl.pathname.includes('/api/og') ||
    req.nextUrl.pathname.includes('/api/webhook') ||
    req.nextUrl.pathname.includes('/api/blast')
  ) {
    return NextResponse.next();
  }

  // Get token from auth_token cookie
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const ts = payload.timestamp as number;

    const timestampSeconds = ts > 1e12 ? Math.floor(ts / 1000) : ts;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const tokenAgeSeconds = nowSeconds - timestampSeconds;

    const maxAgeSeconds = 24 * 60 * 60;

    if (tokenAgeSeconds > maxAgeSeconds) {
      return NextResponse.json(
        { error: 'Token expired, please sign in again' },
        { status: 401 }
      );
    }

    const headers = new Headers(req.headers);
    headers.set('x-user-fid', String(payload.fid));
    headers.set('x-miniapp-validated', 'true');
    headers.set('x-request-timestamp', String(Date.now()));

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
