import { fetchUser } from '@/lib/neynar';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check if request is from mini app
  const isMiniAppValidated = request.headers.get('x-miniapp-validated');
  if (!isMiniAppValidated) {
    return NextResponse.json(
      { error: 'Request must be from Farcaster mini app' },
      { status: 403 }
    );
  }

  const fid = request.headers.get('x-user-fid')!;
  console.log('fid', fid);
  const user = await fetchUser(fid, { fresh: true });
  return NextResponse.json(user);
}
