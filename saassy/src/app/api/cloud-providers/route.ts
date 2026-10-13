import { NextResponse } from 'next/server';

export async function GET() {
  const providers = [
    { id: 'aws', name: 'AWS (Amazon Web Services)', costPerMillion: '$0.20', latencyMs: '12ms', status: 'primary', regions: 32 },
    { id: 'gcp', name: 'GCP (Google Cloud Platform)', costPerMillion: '$0.18', latencyMs: '11ms', status: 'active', regions: 28 },
    { id: 'azure', name: 'Azure (Microsoft)', costPerMillion: '$0.22', latencyMs: '14ms', status: 'active', regions: 26 },
    { id: 'vercel', name: 'Vercel Edge Network', costPerMillion: '$0.25', latencyMs: '8ms', status: 'active', regions: 100 },
  ];

  return NextResponse.json({
    success: true,
    activeProvider: 'AWS (Amazon Web Services)',
    monthlySavingsArbitrage: '$1,420 / mo',
    providers,
  });
}
