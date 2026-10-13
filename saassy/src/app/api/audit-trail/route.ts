import { NextResponse } from 'next/server';

export async function GET() {
  const events = [
    { id: 'aud_9901', user: 'sarah@finpulse.io', action: 'API Key Rotated', resource: 'sk_saassy_live_8f92...', ip: '192.168.1.42', timestamp: new Date(Date.now() - 120000).toISOString() },
    { id: 'aud_9902', user: 'marcus@cloudshift.ai', action: 'Regional Node Deployed', resource: 'eu-central-1', ip: '10.0.4.12', timestamp: new Date(Date.now() - 340000).toISOString() },
    { id: 'aud_9903', user: 'elena@datanexus.com', action: 'RBAC Policy Modified', resource: 'Developer Role', ip: '172.16.0.8', timestamp: new Date(Date.now() - 720000).toISOString() },
    { id: 'aud_9904', user: 'admin@saassy.ai', action: 'Secret Decrypted', resource: 'DATABASE_URL', ip: '127.0.0.1', timestamp: new Date(Date.now() - 1500000).toISOString() },
  ];

  return NextResponse.json({
    success: true,
    totalEvents: events.length,
    events,
  });
}
