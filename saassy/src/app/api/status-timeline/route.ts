import { NextResponse } from 'next/server';

export async function GET() {
  const incidents = [
    { id: 'inc-1', date: '2026-09-28', title: 'Transient BGP reroute in ap-southeast-1', durationSec: 14, status: 'resolved', autoHealed: true },
    { id: 'inc-2', date: '2026-09-14', title: 'Upstream SSL certificate rotation in eu-central-1', durationSec: 8, status: 'resolved', autoHealed: true },
    { id: 'inc-3', date: '2026-08-30', title: 'DDoS mitigation active on US East cluster', durationSec: 42, status: 'resolved', autoHealed: true },
  ];

  return NextResponse.json({
    success: true,
    overallUptime: '99.994%',
    daysMonitored: 90,
    incidents,
  });
}
