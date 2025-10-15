import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { env } from "./lib/env";

export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(req: NextRequest) {
  // Skip auth check for sign-in endpoint
  if (
    req.nextUrl.pathname === "/api/auth/sign-in" ||
    req.nextUrl.pathname.includes("/api/og") ||
    req.nextUrl.pathname.includes("/api/webhook")  ) {
    return NextResponse.next();
  }

  // Get token from auth_token cookie
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    // Verify the token using jose
    const { payload } = await jose.jwtVerify(token, secret);

    // Check if token is too old (prevent long-term caching attacks)
    const tokenAge = Date.now() - (payload.timestamp as number);
    const maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (tokenAge > maxTokenAge) {
      return NextResponse.json(
        { error: "Token expired, please sign in again" },
        { status: 401 }
      );
    }

    // Clone the request headers to add user info
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-fid", payload.fid as string);
    
    // Add timestamp to prevent replay attacks
    requestHeaders.set("x-miniapp-validated", "true");
    requestHeaders.set("x-request-timestamp", Date.now().toString());

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
