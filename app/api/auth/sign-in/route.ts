import { Errors, createClient } from '@farcaster/quick-auth';

import { env } from '@/lib/env';
import { fetchUser } from '@/lib/neynar';
import * as jose from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { Address, zeroAddress } from 'viem';

export const dynamic = 'force-dynamic';

const quickAuthClient = createClient();

export const POST = async (req: NextRequest) => {
  const {
    referrerFid,
    token: farcasterToken,
    fid: contextFid,
  } = await req.json();
  let fid: number | undefined;
  let walletAddress: Address = zeroAddress;
  let isValidSignature = false;

  let expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  // Verify signature matches custody address and auth address
  try {
    const payload = await quickAuthClient.verifyJwt({
      domain: new URL(env.NEXT_PUBLIC_URL).hostname,
      token: farcasterToken,
    });
    isValidSignature = !!payload;
    fid = Number(payload.sub);
    walletAddress = payload.address as `0x${string}`;

    // if (payload.exp) {
    //   expirationTime = payload.exp;
    // }
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      console.error('Quick Auth Error', e);
      isValidSignature = false;
    }
    console.error('Error verifying token', e);
  }

  // Verify that the FID from the Quick Auth token matches the FID from mini app context
  if (!isValidSignature || !fid || fid !== contextFid) {
    return NextResponse.json(
      { success: false, error: 'Invalid token or FID mismatch' },
      { status: 401 }
    );
  }

  const user = await fetchUser(fid.toString());

  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = Math.floor(expirationTime / 1000);

  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new jose.SignJWT({
    fid,
    walletAddress,
    timestamp: nowSec,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(nowSec)
    .setExpirationTime(expSec)
    .sign(secret);

  // Create the response
  const response = NextResponse.json({ success: true, user });

  // Set the auth cookie with the JWT token
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });

  return response;
};
