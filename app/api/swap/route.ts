import { NextRequest, NextResponse } from 'next/server';

const ZEROX_API_URL = 'https://api.0x.org';
const ZEROX_API_KEY = process.env.ZEROX_API_KEY;

export async function GET(request: NextRequest) {
  if (!ZEROX_API_KEY) {
    return NextResponse.json(
      { error: '0x API key not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Missing endpoint parameter' },
      { status: 400 }
    );
  }

  // Build the 0x API URL with all query params except 'endpoint'
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      params.append(key, value);
    }
  });

  const url = `${ZEROX_API_URL}${endpoint}?${params.toString()}`;

  const chainId = searchParams.get('chainId') || '8453';

  try {
    const response = await fetch(url, {
      headers: {
        '0x-api-key': ZEROX_API_KEY,
        '0x-version': 'v2',
        '0x-chain-id': chainId,
      },
    });

    const data = await response.json();

    console.log('0x API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch from 0x API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!ZEROX_API_KEY) {
    return NextResponse.json(
      { error: '0x API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { endpoint, ...params } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }

    const response = await fetch(`${ZEROX_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        '0x-api-key': ZEROX_API_KEY,
        '0x-version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch from 0x API' },
      { status: 500 }
    );
  }
}
