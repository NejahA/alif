import { NextResponse } from 'next/server';

export async function GET() {
  const replicas = [
    { id: 'rep-1', region: 'eu-central-1 (Frankfurt)', lagMs: Math.floor(1 + Math.random() * 2), walStatus: 'caught_up', connections: 42 },
    { id: 'rep-2', region: 'ap-northeast-1 (Tokyo)', lagMs: Math.floor(2 + Math.random() * 3), walStatus: 'caught_up', connections: 28 },
    { id: 'rep-3', region: 'sa-east-1 (São Paulo)', lagMs: Math.floor(3 + Math.random() * 4), walStatus: 'caught_up', connections: 19 },
  ];

  return NextResponse.json({
    success: true,
    primaryNode: 'us-east-1 (N. Virginia)',
    walLSN: '0/1F8A902C',
    syncMode: 'Asynchronous Streaming Replication',
    replicas,
    timestamp: new Date().toISOString(),
  });
}
