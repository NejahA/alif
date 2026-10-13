import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { regionCode = 'us-east-1', action = 'deploy' } = await request.json();

    const deploymentId = `dep_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      deploymentId,
      regionCode,
      action,
      status: 'active',
      propagationTimeMs: Math.floor(320 + Math.random() * 150),
      dnsRecord: `${regionCode}.edge.saassy.ai`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
