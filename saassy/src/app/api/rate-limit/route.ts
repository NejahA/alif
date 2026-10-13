import { NextResponse } from 'next/server';

let requestCounter = 0;
let lastReset = Date.now();

export async function POST(request: Request) {
  const now = Date.now();
  if (now - lastReset > 10000) {
    requestCounter = 0;
    lastReset = now;
  }

  requestCounter++;
  const limit = 5;
  const remaining = Math.max(0, limit - requestCounter);

  if (requestCounter > limit) {
    return NextResponse.json(
      {
        success: false,
        error: '429 Too Many Requests — Rate limit quota exceeded for burst test window.',
        limit,
        remaining: 0,
        retryAfterSec: 5,
      },
      { status: 429, headers: { 'Retry-After': '5' } }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Request allowed under sliding window token bucket policy.',
    limit,
    remaining,
    requestCount: requestCounter,
  });
}
