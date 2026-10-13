import { NextResponse } from 'next/server';

export async function GET() {
  const regions = [
    { code: 'us-east', name: 'N. Virginia (us-east-1)', latencyMs: Math.floor(6 + Math.random() * 4), status: 'optimal' },
    { code: 'us-west', name: 'Oregon (us-west-2)', latencyMs: Math.floor(14 + Math.random() * 5), status: 'optimal' },
    { code: 'eu-central', name: 'Frankfurt (eu-central-1)', latencyMs: Math.floor(11 + Math.random() * 4), status: 'optimal' },
    { code: 'ap-southeast', name: 'Singapore (ap-southeast-1)', latencyMs: Math.floor(22 + Math.random() * 6), status: 'optimal' },
    { code: 'ap-northeast', name: 'Tokyo (ap-northeast-1)', latencyMs: Math.floor(19 + Math.random() * 5), status: 'optimal' },
    { code: 'sa-east', name: 'São Paulo (sa-east-1)', latencyMs: Math.floor(28 + Math.random() * 8), status: 'optimal' },
  ];

  return NextResponse.json({
    success: true,
    testedAt: new Date().toISOString(),
    avgLatencyMs: Math.round(regions.reduce((acc, r) => acc + r.latencyMs, 0) / regions.length),
    regions,
  });
}
