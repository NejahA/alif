import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { primaryRegion = 'us-east-1', backupRegion = 'us-west-2' } = await request.json();

    return NextResponse.json({
      success: true,
      failoverId: `failover_${Math.random().toString(36).substr(2, 9)}`,
      primaryRegion,
      backupRegion,
      failoverTimeMs: Math.floor(45 + Math.random() * 30),
      trafficRoutedPercentage: 100,
      status: 'Active on Backup Node',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
