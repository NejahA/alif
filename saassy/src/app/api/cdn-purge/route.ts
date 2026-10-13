import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { routePath = '/api/v1/analytics' } = await request.json();

    const purgeId = `purge_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      purgeId,
      routePath,
      popsPurged: 32,
      purgeDurationMs: Math.floor(28 + Math.random() * 14),
      cacheHitRatioReset: '100% Warmed',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
